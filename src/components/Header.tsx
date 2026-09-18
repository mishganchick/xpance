import React from 'react';
import { CurrencyCode } from '../types/finance';
import { CURRENCIES, formatMoney } from '../services/currencyService';
import { Flame, Cloud, Laptop, Smartphone, Trophy, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  netWorth: number;
  primaryCurrency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
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
  level,
  streakDays,
  onOpenAchievements,
  onOpenSync,
  isSyncConfigured,
  viewMode,
  onToggleViewMode,
}) => {
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
        <div className="view-mode-toggle desktop-only" title="Переключить режим отображения">
          <button
            className={`view-mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
            onClick={() => onToggleViewMode('desktop')}
          >
            <Laptop size={14} />
            <span>ПК</span>
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
            onClick={() => onToggleViewMode('mobile')}
          >
            <Smartphone size={14} />
            <span>Мобилка</span>
          </button>
        </div>

        {/* Net Worth & Currency Switcher */}
        <div className="net-worth-card">
          <div className="net-worth-label">
            <span>Общий капитал</span>
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
          title={isOnline ? 'Подключено к сети' : 'Режим 100% Офлайн: все данные сохраняются локально'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'Онлайн' : 'Офлайн'}</span>
        </div>

        {/* Google Drive Sync Pill */}
        <button className="currency-badge" onClick={onOpenSync} title="Синхронизация с Google Drive">
          <Cloud size={14} color={isSyncConfigured ? '#00e699' : '#94a3b8'} />
          <span>{isSyncConfigured ? 'GDrive Sync' : 'Бэкап'}</span>
        </button>

        {/* Gamification Trophy Badge */}
        <div className="gamification-badge" onClick={onOpenAchievements} title="Зал ачивок и уровень">
          <div className="streak-pill">
            <Flame size={15} color="#ffb703" />
            <span>{streakDays} дн. стрик</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700 }}>
            <Trophy size={14} color="#00e699" />
            <span>Ур. {level}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
