import { Account, CurrencyCode, CurrencyRate } from '../types/finance';

export const CURRENCIES: Record<CurrencyCode, CurrencyRate> = {
  RUB: { code: 'RUB', symbol: '₽', name: 'Российский рубль', rateToRub: 1 },
  USD: { code: 'USD', symbol: '$', name: 'Доллар США', rateToRub: 92.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Евро', rateToRub: 100.8 },
  USDT: { code: 'USDT', symbol: '₮', name: 'Tether USD', rateToRub: 93.0 },
  KZT: { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', rateToRub: 0.19 },
  GEL: { code: 'GEL', symbol: '₾', name: 'Грузинский лари', rateToRub: 34.2 },
  BTC: { code: 'BTC', symbol: '₿', name: 'Bitcoin (BTC)', rateToRub: 6150000 },
  ETH: { code: 'ETH', symbol: 'Ξ', name: 'Ethereum (ETH)', rateToRub: 232500 },
  TON: { code: 'TON', symbol: '💎', name: 'Toncoin (TON)', rateToRub: 485 },
  SOL: { code: 'SOL', symbol: '◎', name: 'Solana (SOL)', rateToRub: 13950 },
};

export function isCryptoCurrency(currency: CurrencyCode): boolean {
  return currency === 'BTC' || currency === 'ETH' || currency === 'TON' || currency === 'SOL' || currency === 'USDT';
}

export function isCryptoAsset(currency: CurrencyCode): boolean {
  return currency === 'BTC' || currency === 'ETH' || currency === 'TON' || currency === 'SOL';
}

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
 * Расчет эквивалента в USDT для криптовалют
 */
export function getCryptoUsdtEquivalent(amount: number, currency: CurrencyCode): number {
  return convertCurrency(amount, currency, 'USDT');
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
export function formatMoney(amount: number, currency: CurrencyCode, fractionDigits?: number): string {
  const symbol = CURRENCIES[currency]?.symbol || currency;
  
  // Auto-detect optimal decimals for crypto if not explicitly set
  let decimals = fractionDigits;
  if (decimals === undefined) {
    if (currency === 'BTC') decimals = amount % 1 === 0 ? 0 : 4;
    else if (currency === 'ETH') decimals = amount % 1 === 0 ? 0 : 3;
    else if (currency === 'TON' || currency === 'SOL') decimals = amount % 1 === 0 ? 0 : 2;
    else decimals = 0;
  }

  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${formatted} ${symbol}`;
}

/**
 * Форматирование USDT эквивалента со знаком приблизительного равенства
 * например: "≈ 3 240 ₮"
 */
export function formatUsdtEquivalent(amount: number, currency: CurrencyCode): string {
  const usdtVal = getCryptoUsdtEquivalent(amount, currency);
  return `≈ ${formatMoney(usdtVal, 'USDT', usdtVal < 10 ? 2 : 0)}`;
}
