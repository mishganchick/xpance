import { AppDataVault, Category, Account, Transaction } from '../types/finance';
import { INITIAL_ACHIEVEMENTS } from '../achievements/achievementList';
import { evaluateGamification } from '../achievements/achievementEngine';

const VAULT_STORAGE_KEY = 'xpance_vault_v2';
const LEGACY_STORAGE_KEYS = ['xpance_vault_v1', 'nexus_finance_vault_v1'];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_groceries', name: 'Продукты', icon: 'ShoppingBag', color: '#10b981', type: 'expense', defaultTag: 'base' },
  { id: 'cat_dining', name: 'Кафе и Доставка', icon: 'Utensils', color: '#f59e0b', type: 'expense', defaultTag: 'joy' },
  { id: 'cat_transport', name: 'Такси и Транспорт', icon: 'Car', color: '#3b82f6', type: 'expense', defaultTag: 'base' },
  { id: 'cat_impulse_shopping', name: 'Спонтанные покупки', icon: 'Zap', color: '#ef4444', type: 'expense', defaultTag: 'impulse' },
  { id: 'cat_housing', name: 'Жилье и ЖКХ', icon: 'Home', color: '#8b5cf6', type: 'expense', defaultTag: 'base' },
  { id: 'cat_health', name: 'Здоровье и Аптека', icon: 'Activity', color: '#ec4899', type: 'expense', defaultTag: 'base' },
  { id: 'cat_subs', name: 'Подписки и Сервисы', icon: 'Tv', color: '#06b6d4', type: 'expense', defaultTag: 'joy' },
  { id: 'cat_travel', name: 'Путешествия', icon: 'Plane', color: '#14b8a6', type: 'expense', defaultTag: 'joy' },
  { id: 'cat_salary', name: 'Зарплата', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'cat_freelance', name: 'Фриланс / Проекты', icon: 'Laptop', color: '#6366f1', type: 'income' },
  { id: 'cat_invest', name: 'Дивиденды / Вклады', icon: 'TrendingUp', color: '#f59e0b', type: 'income' },
];

export const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc_tbank',
    name: 'Т-Банк Black',
    bankName: 'Т-Банк',
    type: 'debit',
    currency: 'RUB',
    balance: 450200,
    color: '#ffdd2d',
    icon: 'CreditCard',
  },
  {
    id: 'acc_sber',
    name: 'Сбер Премьер',
    bankName: 'Сбер',
    type: 'debit',
    currency: 'RUB',
    balance: 310150,
    color: '#22c55e',
    icon: 'CreditCard',
  },
  {
    id: 'acc_cash_usd',
    name: 'Наличные USD',
    bankName: 'Сейф',
    type: 'cash',
    currency: 'USD',
    balance: 1850,
    color: '#38bdf8',
    icon: 'Banknote',
  },
  {
    id: 'acc_revolut',
    name: 'Revolut EUR',
    bankName: 'Revolut',
    type: 'debit',
    currency: 'EUR',
    balance: 1230,
    color: '#a855f7',
    icon: 'Globe',
  },
  {
    id: 'acc_savings',
    name: 'Накопительный 16%',
    bankName: 'Т-Банк',
    type: 'savings',
    currency: 'RUB',
    balance: 520000,
    color: '#f97316',
    icon: 'PiggyBank',
    interestRate: 16.0,
  },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    amount: 3450,
    currency: 'RUB',
    type: 'expense',
    accountId: 'acc_tbank',
    categoryId: 'cat_groceries',
    rationalityTag: 'base',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    note: 'ВкусВилл — закупка на неделю',
  },
  {
    id: 'tx_2',
    amount: 550,
    currency: 'RUB',
    type: 'expense',
    accountId: 'acc_tbank',
    categoryId: 'cat_dining',
    rationalityTag: 'joy',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    note: 'Кофе и десерт с коллегой',
  },
  {
    id: 'tx_3',
    amount: 4200,
    currency: 'RUB',
    type: 'expense',
    accountId: 'acc_sber',
    categoryId: 'cat_impulse_shopping',
    rationalityTag: 'impulse',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: 'Импульсивная покупка на маркетплейсе',
  },
  {
    id: 'tx_4',
    amount: 720,
    currency: 'RUB',
    type: 'expense',
    accountId: 'acc_tbank',
    categoryId: 'cat_transport',
    rationalityTag: 'base',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    note: 'Такси в аэропорт',
  },
  {
    id: 'tx_5',
    amount: 145000,
    currency: 'RUB',
    type: 'income',
    accountId: 'acc_tbank',
    categoryId: 'cat_salary',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    note: 'Аванс / зарплата',
  },
  {
    id: 'tx_6',
    amount: 85,
    currency: 'USD',
    type: 'expense',
    accountId: 'acc_cash_usd',
    categoryId: 'cat_dining',
    rationalityTag: 'joy',
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    note: 'Ужин в поездке',
  },
];

export const INITIAL_CLEAN_ACCOUNTS: Account[] = [
  {
    id: 'acc_main',
    name: 'Основная карта',
    bankName: 'Т-Банк',
    type: 'debit',
    currency: 'RUB',
    balance: 0,
    color: '#ffdd2d',
    icon: 'CreditCard',
  },
];

export function getInitialVault(): AppDataVault {
  return {
    version: 2,
    accounts: INITIAL_CLEAN_ACCOUNTS,
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    achievements: INITIAL_ACHIEVEMENTS.map((a) => ({
      ...a,
      currentProgress: 0,
      isUnlocked: false,
    })),
    gamification: {
      xp: 0,
      level: 1,
      levelTitle: 'Новичок бюджета',
      currentStreakDays: 0,
      totalLoggedDays: 0,
    },
    primaryCurrency: 'RUB',
    syncConfig: {
      autoSync: true,
      isSignedIn: false,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function getDemoVault(): AppDataVault {
  const rawVault: AppDataVault = {
    version: 1,
    accounts: SEED_ACCOUNTS,
    transactions: SEED_TRANSACTIONS,
    categories: DEFAULT_CATEGORIES,
    achievements: INITIAL_ACHIEVEMENTS,
    gamification: {
      xp: 0,
      level: 1,
      levelTitle: 'Новичок бюджета',
      currentStreakDays: 1,
      totalLoggedDays: 4,
    },
    primaryCurrency: 'RUB',
    syncConfig: {
      autoSync: true,
      isSignedIn: false,
    },
    lastUpdated: new Date().toISOString(),
  };

  const evalResult = evaluateGamification(rawVault);
  return {
    ...rawVault,
    achievements: evalResult.updatedAchievements,
    gamification: evalResult.updatedGamification,
  };
}

export function clearVaultStorage(): AppDataVault {
  try {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
  const clean = getInitialVault();
  saveVaultToStorage(clean);
  return clean;
}

export function loadVaultFromStorage(): AppDataVault {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) {
      // Purge old demo vaults and initialize clean database
      LEGACY_STORAGE_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      const initial = getInitialVault();
      saveVaultToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppDataVault;
    return parsed;
  } catch (err) {
    console.error('Failed to load vault from localStorage:', err);
    return getInitialVault();
  }
}

export function saveVaultToStorage(vault: AppDataVault): void {
  try {
    vault.lastUpdated = new Date().toISOString();
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
  } catch (err) {
    console.error('Failed to save vault to localStorage:', err);
  }
}

export function exportVaultToJson(vault: AppDataVault): string {
  return JSON.stringify(vault, null, 2);
}

export function importVaultFromJson(jsonString: string): AppDataVault {
  const parsed = JSON.parse(jsonString) as AppDataVault;
  if (!parsed.accounts || !parsed.transactions) {
    throw new Error('Некорректный формат файла бэкапа');
  }
  saveVaultToStorage(parsed);
  return parsed;
}
