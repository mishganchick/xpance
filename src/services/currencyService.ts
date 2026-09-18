import { Account, CurrencyCode, CurrencyRate } from '../types/finance';

export const CURRENCIES: Record<CurrencyCode, CurrencyRate> = {
  RUB: { code: 'RUB', symbol: '₽', name: 'Российский рубль', rateToRub: 1 },
  USD: { code: 'USD', symbol: '$', name: 'Доллар США', rateToRub: 92.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Евро', rateToRub: 100.8 },
  USDT: { code: 'USDT', symbol: '₮', name: 'Tether USD', rateToRub: 93.0 },
  KZT: { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', rateToRub: 0.19 },
  GEL: { code: 'GEL', symbol: '₾', name: 'Грузинский лари', rateToRub: 34.2 },
};

/**
 * Конвертация любой валюты в любую другую
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  customRates?: Partial<Record<CurrencyCode, number>>
): number {
  if (from === to) return amount;

  const rateFrom = customRates?.[from] ?? CURRENCIES[from]?.rateToRub ?? 1;
  const rateTo = customRates?.[to] ?? CURRENCIES[to]?.rateToRub ?? 1;

  // Amount in RUB
  const amountInRub = amount * rateFrom;
  // Convert RUB to Target
  return amountInRub / rateTo;
}

/**
 * Расчет общего капитала (Net Worth) во всех валютах
 */
export function calculateNetWorth(accounts: Account[], targetCurrency: CurrencyCode): number {
  return accounts.reduce((total, acc) => {
    if (acc.isArchived) return total;
    const inTarget = convertCurrency(acc.balance, acc.currency, targetCurrency);
    return total + inTarget;
  }, 0);
}

/**
 * Форматирование суммы с символом валюты и разделителями тысяч
 */
export function formatMoney(amount: number, currency: CurrencyCode, fractionDigits = 0): string {
  const symbol = CURRENCIES[currency]?.symbol || currency;
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);

  return `${formatted} ${symbol}`;
}
