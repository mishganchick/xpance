import React from 'react';
import { CurrencyCode } from '../types/finance';
import { CURRENCIES, formatMoney } from '../services/currencyService';
import { Flame, Cloud, Laptop, Smartphone, Trophy, Wifi, WifiOff, Globe } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface HeaderProps {
  netWorth: number;
  primaryCurrency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  level: number;
  levelTitle: string;
  streakDays: number;
  onOpenAchievements: () => void;
  onOpenSync: () => void;
  isSyncConfigured: boolean;
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: (mode: 'desktop' | 'mobile') => void;
}

export const Header: React.FC<HeaderProps> = ({
  netWorth,
  primaryCurrency,
  onCurrencyChange,
  lang,
  onLanguageChange,
  level,
  streakDays,
  onOpenAchievements,
  onOpenSync,
  isSyncConfigured,
  viewMode,
  onToggleViewMode,
}) => {
  const t = getTranslation(lang);
  const currencyList: CurrencyCode[] = ['RUB', 'USD', 'EUR', 'USDT', 'KZT', 'GEL'];
  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="app-header">
      {/* TOP ROW: Brand and Net Worth */}
      <div className="header-top-row">
        <div className="brand-section">
          <div className="brand-logo" style={{ fontSize: '15px', letterSpacing: '-0.5px' }}>XP</div>
          <div>
            <div className="brand-title">XPANCE</div>
            <div className="brand-subtitle">Level Up Wealth</div>
          </div>
        </div>

        {/* Center / View Mode Switcher (Visible only on Desktop for preview) */}
        <div className="view-mode-toggle desktop-only" title="Toggle preview mode">
          <button
            className={`view-mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
            onClick={() => onToggleViewMode('desktop')}
          >
            <Laptop size={14} />
            <span>{t.viewModeDesktop}</span>
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
            onClick={() => onToggleViewMode('mobile')}
          >
            <Smartphone size={14} />
            <span>{t.viewModeMobile}</span>
          </button>
        </div>

        {/* Net Worth, Language & Currency Switcher */}
        <div className="net-worth-card">
          <div className="net-worth-label">
            <span>{t.netWorthLabel}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language Switcher Pill */}
              <button
                type="button"
                className="lang-toggle-btn"
                onClick={() => onLanguageChange(lang === 'ru' ? 'en' : 'ru')}
                title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
              >
                <Globe size={11} />
                <span>{lang.toUpperCase()}</span>
              </button>

              {/* Currency Selector */}
              <select
                value={primaryCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="currency-select"
              >
                {currencyList.map((cur) => (
                  <option key={cur} value={cur} style={{ background: '#121721', color: '#fff' }}>
                    {cur} ({CURRENCIES[cur].symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="net-worth-amount">
            {formatMoney(netWorth, primaryCurrency)}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Status Pills (Scrollable on small screens) */}
      <div className="header-pills-row">
        {/* Offline / Online Status Pill */}
        <div
          className="currency-badge"
          style={{
            borderColor: isOnline ? 'rgba(0, 230, 153, 0.3)' : 'rgba(255, 183, 3, 0.4)',
            color: isOnline ? '#00e699' : '#ffb703',
          }}
          title={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? t.online : t.offline}</span>
        </div>

        {/* Google Drive Sync Pill */}
        <button className="currency-badge" onClick={onOpenSync} title={t.backupTooltip}>
          <Cloud size={14} color={isSyncConfigured ? '#00e699' : '#94a3b8'} />
          <span>{isSyncConfigured ? 'GDrive Sync' : (lang === 'en' ? 'Backup' : 'Бэкап')}</span>
        </button>

        {/* Gamification Trophy Badge */}
        <div className="gamification-badge" onClick={onOpenAchievements} title={t.achievementsTooltip}>
          <div className="streak-pill">
            <Flame size={15} color="#ffb703" />
            <span>{streakDays} {t.streakDays}</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700 }}>
            <Trophy size={14} color="#00e699" />
            <span>{t.level} {level}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
