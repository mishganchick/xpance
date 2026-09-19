import { BudgetTopUp, CurrencyCode, PeriodBudget, Transaction } from '../types/finance';
import { convertCurrency } from './currencyService';

export interface BudgetMetrics {
  totalBudget: number;         // Суммарный бюджет с учётом пополнений
  baseBudget: number;          // Изначальный бюджет
  topUpsTotal: number;         // Сумма пополнений
  spentInPeriod: number;       // Потрачено за весь период
  remainingBudget: number;     // Осталось до конца периода
  totalDays: number;           // Всего дней в периоде
  daysRemaining: number;       // Дней осталось (включая сегодня)
  dailyAllowanceToday: number; // Норма трат на сегодня
  spentToday: number;          // Уже потрачено сегодня
  remainingToday: number;      // Осталось потратить сегодня (может быть < 0 при перерасходе)
  percentUsed: number;         // % израсходованного бюджета
  status: 'ok' | 'warning' | 'exceeded';
  currency: CurrencyCode;
}

/**
 * Получить дату в формате YYYY-MM-DD для локального времени
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Пресеты для дат бюджета
 */
export function getDefaultMonthBudgetDates(): { startDate: string; endDate: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: formatLocalDate(firstDay),
    endDate: formatLocalDate(lastDay),
  };
}

export function getRestOfMonthDates(): { startDate: string; endDate: string } {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: formatLocalDate(now),
    endDate: formatLocalDate(lastDay),
  };
}

export function getPresetDaysDates(days: number): { startDate: string; endDate: string } {
  const now = new Date();
  const target = new Date(now.getTime() + (days - 1) * 86400000);
  return {
    startDate: formatLocalDate(now),
    endDate: formatLocalDate(target),
  };
}

/**
 * Расчет метрик динамического бюджета (дневной лимит с автоматическим переносом остатка)
 */
export function calculateBudgetMetrics(
  budget: PeriodBudget,
  transactions: Transaction[]
): BudgetMetrics {
  const currency = budget.currency;
  const baseBudget = budget.totalAmount || 0;
  const topUpsTotal = (budget.topUps || []).reduce((acc: number, t: BudgetTopUp) => acc + t.amount, 0);
  const totalBudget = baseBudget + topUpsTotal || 1;

  const now = new Date();
  const todayStr = formatLocalDate(now);

  const start = new Date(budget.startDate + 'T00:00:00');
  const end = new Date(budget.endDate + 'T23:59:59');

  // Расчет дней периода
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalDays = Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / 86400000) + 1);
  let daysRemaining = Math.round((endDay.getTime() - todayDay.getTime()) / 86400000) + 1;
  if (daysRemaining < 1) daysRemaining = 1;

  // Фильтрация расходов в рамках периода бюджета
  let spentInPeriod = 0;
  let spentToday = 0;

  transactions.forEach((tx) => {
    if (tx.type !== 'expense') return;
    const txTime = new Date(tx.date).getTime();
    if (txTime >= start.getTime() && txTime <= end.getTime()) {
      const inBudgetCurrency = convertCurrency(tx.amount, tx.currency, currency);
      spentInPeriod += inBudgetCurrency;

      // Траты за сегодня
      if (tx.date.startsWith(todayStr)) {
        spentToday += inBudgetCurrency;
      }
    }
  });

  const remainingBudget = Math.max(0, totalBudget - spentInPeriod);

  // Дневной лимит на сегодня (Tzlvt formula):
  // До трат сегодня было: (remainingBudget + spentToday)
  // Делим доступный остаток на оставшиеся дни:
  const dailyAllowanceToday = Math.max(0, Math.round((remainingBudget + spentToday) / daysRemaining));
  const remainingToday = dailyAllowanceToday - spentToday;

  const percentUsed = Math.min(100, Math.max(0, Math.round((spentInPeriod / totalBudget) * 100)));

  let status: 'ok' | 'warning' | 'exceeded' = 'ok';
  if (remainingToday < 0) {
    status = 'exceeded';
  } else if (remainingToday <= dailyAllowanceToday * 0.25) {
    status = 'warning';
  }

  return {
    totalBudget,
    baseBudget,
    topUpsTotal,
    spentInPeriod: Math.round(spentInPeriod),
    remainingBudget: Math.round(remainingBudget),
    totalDays,
    daysRemaining,
    dailyAllowanceToday,
    spentToday: Math.round(spentToday),
    remainingToday: Math.round(remainingToday),
    percentUsed,
    status,
    currency,
  };
}
