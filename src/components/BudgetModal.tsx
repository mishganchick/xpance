import React, { useState, useEffect } from 'react';
import { CurrencyCode, PeriodBudget } from '../types/finance';
import { CURRENCIES, formatMoney } from '../services/currencyService';
import { getDefaultMonthBudgetDates, getPresetDaysDates, getRestOfMonthDates } from '../services/budgetService';
import { Language, getTranslation } from '../services/i18n';
import { X, Target, Plus, Trash2, Calendar, DollarSign } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: PeriodBudget;
  primaryCurrency: CurrencyCode;
  lang?: Language;
  initialMode?: 'configure' | 'topup';
  onSaveBudget: (budget: PeriodBudget) => void;
  onTopUpBudget: (amount: number, note?: string) => void;
  onDeleteBudget: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  primaryCurrency,
  lang = 'ru',
  initialMode = 'configure',
  onSaveBudget,
  onTopUpBudget,
  onDeleteBudget,
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'configure' | 'topup'>(initialMode);

  // Configure State
  const defaultDates = getDefaultMonthBudgetDates();
  const [amount, setAmount] = useState(budget ? budget.totalAmount.toString() : '50000');
  const [currency, setCurrency] = useState<CurrencyCode>(budget ? budget.currency : primaryCurrency);
  const [startDate, setStartDate] = useState(budget ? budget.startDate : defaultDates.startDate);
  const [endDate, setEndDate] = useState(budget ? budget.endDate : defaultDates.endDate);

  // Top Up State
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpNote, setTopUpNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      if (budget) {
        setAmount(budget.totalAmount.toString());
        setCurrency(budget.currency);
        setStartDate(budget.startDate);
        setEndDate(budget.endDate);
      } else {
        const d = getDefaultMonthBudgetDates();
        setStartDate(d.startDate);
        setEndDate(d.endDate);
      }
      setTopUpAmount('');
      setTopUpNote('');
    }
  }, [isOpen, initialMode, budget]);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'end_of_month' | 'rest_of_month' | '30_days' | '7_days') => {
    if (type === 'end_of_month') {
      const d = getDefaultMonthBudgetDates();
      setStartDate(d.startDate);
      setEndDate(d.endDate);
    } else if (type === 'rest_of_month') {
      const d = getRestOfMonthDates();
      setStartDate(d.startDate);
      setEndDate(d.endDate);
    } else if (type === '30_days') {
      const d = getPresetDaysDates(30);
      setStartDate(d.startDate);
      setEndDate(d.endDate);
    } else if (type === '7_days') {
      const d = getPresetDaysDates(7);
      setStartDate(d.startDate);
      setEndDate(d.endDate);
    }
  };

  const handleSaveConfigure = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onSaveBudget({
      id: budget?.id || `budget_${Date.now()}`,
      totalAmount: parsedAmount,
      startDate,
      endDate,
      currency,
      topUps: budget?.topUps || [],
    });
    onClose();
  };

  const handleSaveTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(topUpAmount);
    if (!parsedAmt || parsedAmt <= 0) return;

    onTopUpBudget(parsedAmt, topUpNote.trim() || undefined);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Header with Title and Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ffb703 0%, #ff8800 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target size={18} color="#150f02" />
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>
              {activeTab === 'topup' ? t.budgetTopUpModalTitle : t.budgetModalTitle}
            </h2>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Tab switchers if budget already exists */}
        {budget && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('configure')}
              className={`cat-pill ${activeTab === 'configure' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              {t.configureBudgetBtn}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('topup')}
              className={`cat-pill ${activeTab === 'topup' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              {t.topUpBtn}
            </button>
          </div>
        )}

        {/* TAB 1: CONFIGURE BUDGET */}
        {activeTab === 'configure' && (
          <form onSubmit={handleSaveConfigure} style={{ display: 'flex', flexFlow: 'column', gap: '14px' }}>
            {/* Amount and Currency */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.budgetAmountLabel}</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.budgetCurrencyLabel}</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="RUB">RUB (₽)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USDT">USDT (₮)</option>
                  <option value="KZT">KZT (₸)</option>
                  <option value="GEL">GEL (₾)</option>
                  <option value="BTC">BTC (₿)</option>
                  <option value="ETH">ETH (Ξ)</option>
                  <option value="TON">TON (💎)</option>
                  <option value="SOL">SOL (◎)</option>
                </select>
              </div>
            </div>

            {/* Quick Date Presets */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lang === 'ru' ? 'Быстрый выбор периода:' : 'Quick Period Preset:'}
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => handleApplyPreset('end_of_month')}
                >
                  📅 {t.presetUntilEndOfMonth}
                </button>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => handleApplyPreset('30_days')}
                >
                  30 {t.streakDays}
                </button>
                <button
                  type="button"
                  className="preset-pill"
                  onClick={() => handleApplyPreset('7_days')}
                >
                  7 {t.streakDays}
                </button>
              </div>
            </div>

            {/* Start and End Date pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.budgetStartDateLabel}</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.budgetEndDateLabel}</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', alignItems: 'center' }}>
              {budget && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(t.resetBudgetConfirm)) {
                      onDeleteBudget();
                      onClose();
                    }
                  }}
                  className="cat-pill"
                  style={{
                    color: 'var(--accent-ruby)',
                    borderColor: 'rgba(255, 59, 92, 0.3)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title={t.resetBudgetBtn}
                >
                  <Trash2 size={13} />
                  <span>{t.resetBudgetBtn}</span>
                </button>
              )}

              <button type="button" className="cat-pill" onClick={onClose} style={{ flex: 1, padding: '10px' }}>
                {t.cancelBtn}
              </button>

              <button type="submit" className="btn-primary" style={{ flex: 2, padding: '10px' }}>
                {t.saveBudgetBtn}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: QUICK TOP UP */}
        {activeTab === 'topup' && (
          <form onSubmit={handleSaveTopUp} style={{ display: 'flex', flexFlow: 'column', gap: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {lang === 'ru'
                ? 'Получили премию, подарок или хотите расширить лимит на оставшиеся дни? Прибавьте сумму к бюджету текущего периода.'
                : 'Received a bonus, gift, or want to increase your allowance? Add an extra amount to your current period budget.'}
            </p>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.topUpAmountLabel}</label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  placeholder="5000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  style={{ width: '100%', fontSize: '16px', fontWeight: 700 }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {CURRENCIES[budget?.currency || primaryCurrency]?.symbol}
                </span>
              </div>
            </div>

            {/* Quick TopUp Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[1000, 3000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  className="preset-pill"
                  onClick={() => {
                    const cur = parseFloat(topUpAmount) || 0;
                    setTopUpAmount((cur + val).toString());
                  }}
                >
                  +{val}
                </button>
              ))}
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lang === 'ru' ? 'Заметка / Источник (необязательно)' : 'Note / Source (optional)'}
              </label>
              <input
                type="text"
                placeholder={t.topUpNotePlaceholder}
                value={topUpNote}
                onChange={(e) => setTopUpNote(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type="button" className="cat-pill" onClick={onClose} style={{ flex: 1, padding: '10px' }}>
                {t.cancelBtn}
              </button>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: '10px',
                  background: 'var(--accent-emerald)',
                  color: '#051410',
                  fontWeight: 800,
                }}
              >
                <Plus size={16} />
                <span>{t.confirmTopUpBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
