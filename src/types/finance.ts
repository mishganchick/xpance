export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'USDT' | 'KZT' | 'GEL' | 'BTC' | 'ETH' | 'TON' | 'SOL';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToRub: number; // How many RUB for 1 unit of this currency
}

export type AccountType = 'debit' | 'credit' | 'savings' | 'cash' | 'crypto';

export interface Account {
  id: string;
  name: string;
  bankName: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  color: string;
  icon: string;
  creditLimit?: number;
  gracePeriodDays?: number;
  interestRate?: number; // % p.a. for savings
  isArchived?: boolean;
}

export type RationalityTag = 'base' | 'joy' | 'impulse';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  defaultTag?: RationalityTag;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  type: 'expense' | 'income' | 'transfer';
  accountId: string;
  toAccountId?: string; // for transfer
  categoryId?: string;
  rationalityTag?: RationalityTag; // base (🟢), joy (🟡), impulse (🔴)
  date: string; // ISO string
  note?: string;
  exchangeRate?: number; // in case of transfer between different currencies
}

export type AchievementCategory = 'discipline' | 'wealth' | 'habit' | 'anti_impulse';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  targetCount: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  rewardXp: number;
  ruleType:
    | 'streak_no_impulse'
    | 'total_logged'
    | 'multi_currency_accounts'
    | 'low_impulse_month'
    | 'savings_created'
    | 'first_transfer'
    | 'first_transaction';
}

export interface UserGamification {
  xp: number;
  level: number;
  levelTitle: string;
  currentStreakDays: number; // days without impulse spending
  totalLoggedDays: number;
  lastLoggedDate?: string;
}

export interface DriveSyncConfig {
  clientId?: string;
  apiKey?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  isSignedIn: boolean;
  userEmail?: string;
}

export interface BudgetTopUp {
  id: string;
  amount: number;
  date: string; // ISO string
  note?: string;
}

export interface PeriodBudget {
  id: string;
  totalAmount: number; // base allocated budget
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  currency: CurrencyCode;
  topUps?: BudgetTopUp[];
}

export interface AppDataVault {
  version: number;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  achievements: Achievement[];
  gamification: UserGamification;
  primaryCurrency: CurrencyCode;
  syncConfig: DriveSyncConfig;
  budget?: PeriodBudget;
  lastUpdated: string;
}
