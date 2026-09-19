import React from 'react';
import { CurrencyCode, PeriodBudget, Transaction } from '../types/finance';
import { calculateBudgetMetrics } from '../services/budgetService';
import { formatMoney } from '../services/currencyService';
import { Language, getTranslation } from '../services/i18n';
import { Plus, Settings, AlertTriangle, ShieldCheck, Target, Zap } from 'lucide-react';

interface BudgetTzlvtCardProps {
  budget?: PeriodBudget;
  transactions: Transaction[];
  primaryCurrency: CurrencyCode;
  lang?: Language;
  onOpenBudgetModal: () => void;
  onOpenTopUpModal: () => void;
}

export const BudgetTzlvtCard: React.FC<BudgetTzlvtCardProps> = ({
  budget,
  transactions,
  primaryCurrency,
  lang = 'ru',
  onOpenBudgetModal,
  onOpenTopUpModal,
}) => {
  const t = getTranslation(lang);

  // If no budget is configured yet, show an inviting onboarding banner
  if (!budget || !budget.totalAmount) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '16px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.08) 0%, rgba(0, 230, 153, 0.05) 100%)',
          border: '1px dashed rgba(255, 183, 3, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', flex: 1 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#0a0d12',
              border: '1px solid rgba(123, 97, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 15px rgba(123, 97, 255, 0.35)',
              overflow: 'hidden',
            }}
          >
            <img src="./mascot.png" alt="Mascot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
              {t.noBudgetTitle}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
              {t.noBudgetDesc}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenBudgetModal}
          className="btn-primary"
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            background: 'var(--accent-joy)',
            color: '#150f02',
            fontWeight: 800,
            boxShadow: '0 0 15px rgba(255, 183, 3, 0.25)',
          }}
        >
          <span>{t.setBudgetBtn}</span>
        </button>
      </div>
    );
  }

  const metrics = calculateBudgetMetrics(budget, transactions);

  // Status styling
  let statusColor = '#00e699';
  let statusBg = 'rgba(0, 230, 153, 0.12)';
  if (metrics.status === 'exceeded') {
    statusColor = '#ff3b5c';
    statusBg = 'rgba(255, 59, 92, 0.15)';
  } else if (metrics.status === 'warning') {
    statusColor = '#ffb703';
    statusBg = 'rgba(255, 183, 3, 0.15)';
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '16px 18px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(20, 26, 36, 0.8) 0%, rgba(13, 17, 23, 0.95) 100%)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'rgba(255, 183, 3, 0.15)',
              color: 'var(--accent-joy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={14} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {t.budgetWidgetTitle}
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 7px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            {t.periodDaysLeftLabel.replace('{days}', metrics.daysRemaining.toString())}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onOpenTopUpModal}
            className="cat-pill"
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              color: 'var(--accent-emerald)',
              borderColor: 'rgba(0, 230, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
            }}
            title={t.budgetTopUpModalTitle}
          >
            <Plus size={12} />
            <span>{t.topUpBtn}</span>
          </button>

          <button
            onClick={onOpenBudgetModal}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '6px',
              padding: '5px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={t.configureBudgetBtn}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Main Focus: Today's Daily Allowance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 600 }}>
            {t.dailyAllowanceLabel}
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
            {formatMoney(metrics.dailyAllowanceToday, metrics.currency)}
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>
              {lang === 'ru' ? '/ день' : '/ day'}
            </span>
          </div>
        </div>

        {/* Day Status Pill */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '8px',
              background: statusBg,
              color: statusColor,
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            {metrics.remainingToday >= 0 ? (
              <>
                <ShieldCheck size={13} />
                <span>{t.remainingTodayLabel} {formatMoney(metrics.remainingToday, metrics.currency)}</span>
              </>
            ) : (
              <>
                <AlertTriangle size={13} />
                <span>{t.overbudgetTodayLabel} {formatMoney(Math.abs(metrics.remainingToday), metrics.currency)}</span>
              </>
            )}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.spentTodayLabel} {formatMoney(metrics.spentToday, metrics.currency)}
          </div>
        </div>
      </div>

      {/* Period Progress Bar */}
      <div>
        <div
          style={{
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            marginBottom: '6px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${metrics.percentUsed}%`,
              background: metrics.percentUsed > 90 ? 'var(--accent-ruby)' : 'linear-gradient(90deg, #ffb703 0%, #00e699 100%)',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>
            {t.periodRemainingLabel} <strong style={{ color: '#fff' }}>{formatMoney(metrics.remainingBudget, metrics.currency)}</strong>
          </span>
          <span>
            {t.periodTotalLabel.replace('{total}', formatMoney(metrics.totalBudget, metrics.currency))} ({metrics.percentUsed}%)
          </span>
        </div>
      </div>
    </div>
  );
};
