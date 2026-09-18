import { Achievement, AppDataVault, UserGamification } from '../types/finance';

const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: 'Новичок бюджета' },
  { minLevel: 2, title: 'Осознанный контролёр' },
  { minLevel: 3, title: 'Истребитель импульсов' },
  { minLevel: 4, title: 'Мастер мультивалют' },
  { minLevel: 5, title: 'Хранитель активов' },
  { minLevel: 6, title: 'Стратег капитала' },
  { minLevel: 7, title: 'Финансовый Мудрец (Financial Sage)' },
];

export function getLevelTitle(level: number): string {
  let title = 'Новичок бюджета';
  for (const item of LEVEL_TITLES) {
    if (level >= item.minLevel) {
      title = item.title;
    }
  }
  return title;
}

export function calculateLevelInfo(xp: number): { level: number; levelTitle: string; xpCurrent: number; xpForNext: number; progressPercent: number } {
  // Simple progressive formula:
  // Level 1: 0 - 150
  // Level 2: 150 - 400 (+250)
  // Level 3: 400 - 800 (+400)
  // Level N: threshold increases
  const thresholds = [0, 150, 400, 800, 1400, 2200, 3200, 4500, 6000, 8000];
  let level = 1;
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelBase = thresholds[level - 1] || 0;
  const nextLevelTarget = thresholds[level] || currentLevelBase + 2000;
  const xpCurrent = xp - currentLevelBase;
  const xpForNext = nextLevelTarget - currentLevelBase;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpCurrent / xpForNext) * 100)));

  return {
    level,
    levelTitle: getLevelTitle(level),
    xpCurrent,
    xpForNext,
    progressPercent,
  };
}

/**
 * Расчет дней подряд без импульсивных трат
 */
export function calculateNoImpulseStreak(transactions: AppDataVault['transactions']): number {
  if (!transactions.length) return 0;

  // Группируем траты по дате (YYYY-MM-DD)
  const daysMap = new Map<string, { totalExpenses: number; impulseCount: number }>();

  transactions.forEach((tx) => {
    if (tx.type !== 'expense') return;
    const day = tx.date.split('T')[0];
    const existing = daysMap.get(day) || { totalExpenses: 0, impulseCount: 0 };
    existing.totalExpenses += 1;
    if (tx.rationalityTag === 'impulse') {
      existing.impulseCount += 1;
    }
    daysMap.set(day, existing);
  });

  const sortedDays = Array.from(daysMap.keys()).sort().reverse();
  if (!sortedDays.length) return 0;

  let streak = 0;
  for (const day of sortedDays) {
    const stats = daysMap.get(day);
    if (stats && stats.impulseCount === 0 && stats.totalExpenses > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Запуск проверки всех ачивок и обновление профиля геймификации
 */
export function evaluateGamification(vault: AppDataVault): {
  updatedAchievements: Achievement[];
  updatedGamification: UserGamification;
  newlyUnlocked: Achievement[];
} {
  const newlyUnlocked: Achievement[] = [];
  const currentStreak = calculateNoImpulseStreak(vault.transactions);

  // Уникальные валюты счетов
  const uniqueCurrencies = new Set(vault.accounts.map((a) => a.currency)).size;

  // Наличие сберегательных счетов
  const hasSavings = vault.accounts.some((a) => a.type === 'savings' || (a.interestRate && a.interestRate > 0));

  // Наличие переводов
  const hasTransfers = vault.transactions.some((t) => t.type === 'transfer');

  // Доля импульсивных трат за последние 30 дней
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentExpenses = vault.transactions.filter((t) => t.type === 'expense' && t.date >= thirtyDaysAgo);
  const totalExpenseSum = recentExpenses.reduce((acc, t) => acc + t.amount, 0);
  const impulseSum = recentExpenses
    .filter((t) => t.rationalityTag === 'impulse')
    .reduce((acc, t) => acc + t.amount, 0);
  const impulseRatio = totalExpenseSum > 0 ? impulseSum / totalExpenseSum : 0;

  let totalXp = vault.gamification.xp;

  const updatedAchievements = vault.achievements.map((ach) => {
    if (ach.isUnlocked) {
      return ach;
    }

    let progress = ach.currentProgress;
    let unlocked = false;

    switch (ach.ruleType) {
      case 'first_transaction':
        progress = vault.transactions.length > 0 ? 1 : 0;
        unlocked = progress >= ach.targetCount;
        break;
      case 'streak_no_impulse':
        progress = currentStreak;
        unlocked = currentStreak >= ach.targetCount;
        break;
      case 'multi_currency_accounts':
        progress = uniqueCurrencies;
        unlocked = uniqueCurrencies >= ach.targetCount;
        break;
      case 'savings_created':
        progress = hasSavings ? 1 : 0;
        unlocked = hasSavings;
        break;
      case 'first_transfer':
        progress = hasTransfers ? 1 : 0;
        unlocked = hasTransfers;
        break;
      case 'total_logged':
        progress = vault.transactions.length;
        unlocked = vault.transactions.length >= ach.targetCount;
        break;
      case 'low_impulse_month':
        if (recentExpenses.length >= 5) {
          progress = impulseRatio <= 0.15 ? 1 : 0;
          unlocked = impulseRatio <= 0.15;
        }
        break;
    }

    if (unlocked && !ach.isUnlocked) {
      totalXp += ach.rewardXp;
      const updatedAch: Achievement = {
        ...ach,
        currentProgress: ach.targetCount,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      newlyUnlocked.push(updatedAch);
      return updatedAch;
    }

    return {
      ...ach,
      currentProgress: Math.min(progress, ach.targetCount),
    };
  });

  const levelInfo = calculateLevelInfo(totalXp);

  const updatedGamification: UserGamification = {
    xp: totalXp,
    level: levelInfo.level,
    levelTitle: levelInfo.levelTitle,
    currentStreakDays: currentStreak,
    totalLoggedDays: new Set(vault.transactions.map((t) => t.date.split('T')[0])).size,
    lastLoggedDate: vault.transactions.length ? vault.transactions[0].date : undefined,
  };

  return {
    updatedAchievements,
    updatedGamification,
    newlyUnlocked,
  };
}
