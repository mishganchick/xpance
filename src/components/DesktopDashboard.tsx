import React, { useState } from 'react';
import { Account, Category, CurrencyCode, RationalityTag, Transaction, UserGamification } from '../types/finance';
import { convertCurrency, formatMoney } from '../services/currencyService';
import { Shield, Sparkles, AlertTriangle, Search, Trash2, Trophy, ArrowRight } from 'lucide-react';

interface DesktopDashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  primaryCurrency: CurrencyCode;
  gamification: UserGamification;
  onDeleteTransaction: (id: string) => void;
  onOpenAchievements: () => void;
  hideGamificationWidget?: boolean;
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  transactions,
  accounts,
  categories,
  primaryCurrency,
  gamification,
  onDeleteTransaction,
  onOpenAchievements,
  hideGamificationWidget = false,
}) => {
  const [filterTag, setFilterTag] = useState<RationalityTag | 'all' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate Expenses Breakdown
  const expenses = transactions.filter((t) => t.type === 'expense');
  let totalBase = 0;
  let totalJoy = 0;
  let totalImpulse = 0;

  expenses.forEach((tx) => {
    const inPrimary = convertCurrency(tx.amount, tx.currency, primaryCurrency);
    if (tx.rationalityTag === 'base') totalBase += inPrimary;
    else if (tx.rationalityTag === 'joy') totalJoy += inPrimary;
    else if (tx.rationalityTag === 'impulse') totalImpulse += inPrimary;
  });

  const totalExpenseSum = totalBase + totalJoy + totalImpulse || 1;
  const basePercent = Math.round((totalBase / totalExpenseSum) * 100);
  const joyPercent = Math.round((totalJoy / totalExpenseSum) * 100);
  const impulsePercent = Math.round((totalImpulse / totalExpenseSum) * 100);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterTag === 'income' && tx.type !== 'income') return false;
    if (filterTag !== 'all' && filterTag !== 'income') {
      if (tx.type !== 'expense' || tx.rationalityTag !== filterTag) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cat = categories.find((c) => c.id === tx.categoryId)?.name.toLowerCase() || '';
      const acc = accounts.find((a) => a.id === tx.accountId)?.name.toLowerCase() || '';
      const note = (tx.note || '').toLowerCase();
      if (!cat.includes(q) && !acc.includes(q) && !note.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className={`dashboard-layout ${hideGamificationWidget ? 'single-col' : ''}`}>
      {/* MAIN COLUMN: Analytics & Impulse Radar */}
      <div style={{ width: '100%' }}>
        {/* Impulse vs Rationality Radar Card */}
        <div className="glass-card" style={{ padding: '18px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Радар разумности трат</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Распределение расходов по осознанности
              </p>
            </div>
            {impulsePercent > 20 ? (
              <span style={{ fontSize: '11px', color: 'var(--accent-ruby)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}>
                <AlertTriangle size={13} /> Всплеск импульсов!
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}>
                <Shield size={13} /> Отличный контроль
              </span>
            )}
          </div>

          {/* Segmented Progress Bar */}
          <div
            style={{
              height: '12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '14px',
            }}
          >
            <div style={{ width: `${basePercent}%`, background: '#10b981' }} title={`Базовые: ${basePercent}%`} />
            <div style={{ width: `${joyPercent}%`, background: '#ffb703' }} title={`В радость: ${joyPercent}%`} />
            <div style={{ width: `${impulsePercent}%`, background: '#ff3b5c' }} title={`Импульсивные: ${impulsePercent}%`} />
          </div>

          {/* Responsive Stats Cards */}
          <div className="radar-stats-grid">
            <div className="radar-stat-card base">
              <div className="radar-stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                  <Shield size={13} /> Base (Обязательное)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{basePercent}%</div>
              </div>
              <div className="radar-stat-amount">
                {formatMoney(totalBase, primaryCurrency)}
              </div>
            </div>

            <div className="radar-stat-card joy">
              <div className="radar-stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#ffb703', fontWeight: 700 }}>
                  <Sparkles size={13} /> Joy (В радость)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{joyPercent}%</div>
              </div>
              <div className="radar-stat-amount">
                {formatMoney(totalJoy, primaryCurrency)}
              </div>
            </div>

            <div className="radar-stat-card impulse">
              <div className="radar-stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#ff3b5c', fontWeight: 700 }}>
                  <AlertTriangle size={13} /> Impulse (Неразумно)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{impulsePercent}%</div>
              </div>
              <div className="radar-stat-amount" style={{ color: '#ff3b5c' }}>
                {formatMoney(totalImpulse, primaryCurrency)}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Ledger */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Журнал операций</h3>

            {/* Filter Pills */}
            <div className="ledger-filters-row">
              <button
                className={`cat-pill ${filterTag === 'all' ? 'active' : ''}`}
                onClick={() => setFilterTag('all')}
              >
                Все
              </button>
              <button
                className={`cat-pill ${filterTag === 'impulse' ? 'active' : ''}`}
                onClick={() => setFilterTag('impulse')}
                style={{ color: '#ff3b5c' }}
              >
                ⚠️ Импульсы
              </button>
              <button
                className={`cat-pill ${filterTag === 'joy' ? 'active' : ''}`}
                onClick={() => setFilterTag('joy')}
                style={{ color: '#ffb703' }}
              >
                ✨ Радость
              </button>
              <button
                className={`cat-pill ${filterTag === 'income' ? 'active' : ''}`}
                onClick={() => setFilterTag('income')}
                style={{ color: '#10b981' }}
              >
                + Доходы
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Поиск по заметке, категории или банку..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '34px', fontSize: '12px' }}
            />
          </div>

          {/* Transactions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '440px', overflowY: 'auto' }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
                Операции не найдены
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const acc = accounts.find((a) => a.id === tx.accountId);
                const cat = categories.find((c) => c.id === tx.categoryId);
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';

                let tagBadge = null;
                if (isExpense) {
                  if (tx.rationalityTag === 'impulse') {
                    tagBadge = <span style={{ fontSize: '9px', color: '#ff3b5c', background: 'rgba(255, 59, 92, 0.15)', padding: '2px 5px', borderRadius: '4px', fontWeight: 700 }}>⚠️ Импульс</span>;
                  } else if (tx.rationalityTag === 'joy') {
                    tagBadge = <span style={{ fontSize: '9px', color: '#ffb703', background: 'rgba(255, 183, 3, 0.15)', padding: '2px 5px', borderRadius: '4px', fontWeight: 700 }}>✨ В радость</span>;
                  } else {
                    tagBadge = <span style={{ fontSize: '9px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 5px', borderRadius: '4px', fontWeight: 700 }}>🌿 База</span>;
                  }
                }

                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          backgroundColor: cat?.color ? `${cat.color}22` : 'rgba(255, 255, 255, 0.05)',
                          color: cat?.color || '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {cat?.name?.charAt(0) || '•'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat?.name || 'Перевод'}
                          </span>
                          {tagBadge}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {acc?.name} • {new Date(tx.date).toLocaleDateString('ru-RU')}
                          {tx.note && ` • ${tx.note}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: isIncome ? '#00e699' : isExpense && tx.rationalityTag === 'impulse' ? '#ff3b5c' : '#f8fafc',
                          }}
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatMoney(tx.amount, tx.currency)}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                        title="Удалить"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Gamification Widget (Only on desktop if not hidden) */}
      {!hideGamificationWidget && (
        <div className="dashboard-sidebar">
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Финансовый Герой</h3>
              <button
                className="cat-pill"
                onClick={onOpenAchievements}
                style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--accent-joy)' }}
              >
                <span>Все трофеи</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffb703 0%, #ff3b5c 100%)',
                  margin: '0 auto 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(255, 183, 3, 0.35)',
                }}
              >
                <Trophy size={28} color="#150f02" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900 }}>{gamification.levelTitle}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Уровень {gamification.level} • {gamification.xp} XP
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(255, 183, 3, 0.08)',
                border: '1px solid rgba(255, 183, 3, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-joy)', fontWeight: 700 }}>
                Стрик осознанности
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent-joy)' }}>
                🔥 {gamification.currentStreakDays} дн.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
