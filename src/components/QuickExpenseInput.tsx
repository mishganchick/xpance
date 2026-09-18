import React, { useState } from 'react';
import { Account, Category, RationalityTag, Transaction } from '../types/finance';
import { CURRENCIES, formatMoney } from '../services/currencyService';
import { Sparkles, Shield, AlertTriangle, Check, ArrowDownCircle, ArrowUpCircle, CreditCard, ChevronDown } from 'lucide-react';

interface QuickExpenseInputProps {
  accounts: Account[];
  categories: Category[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export const QuickExpenseInput: React.FC<QuickExpenseInputProps> = ({
  accounts,
  categories,
  onAddTransaction,
}) => {
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [rationalityTag, setRationalityTag] = useState<RationalityTag>('base');
  const [note, setNote] = useState('');

  React.useEffect(() => {
    if (!accounts.some((a) => a.id === selectedAccountId)) {
      setSelectedAccountId(accounts[0]?.id || '');
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const activeCategories = categories.filter((c) => c.type === txType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onAddTransaction({
      amount: parsedAmount,
      currency: selectedAccount ? selectedAccount.currency : 'RUB',
      type: txType,
      accountId: selectedAccountId || (accounts[0] ? accounts[0].id : ''),
      categoryId: selectedCategoryId,
      rationalityTag: txType === 'expense' ? rationalityTag : undefined,
      date: new Date().toISOString(),
      note: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
  };

  const addPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  return (
    <div className="quick-input-card">
      {/* 1. Segmented Type Toggle (Расход / Доход) */}
      <div className="type-toggle-segmented">
        <button
          type="button"
          className={`type-seg-btn expense ${txType === 'expense' ? 'active' : ''}`}
          onClick={() => setTxType('expense')}
        >
          <ArrowDownCircle size={16} />
          <span>Расход</span>
        </button>
        <button
          type="button"
          className={`type-seg-btn income ${txType === 'income' ? 'active' : ''}`}
          onClick={() => setTxType('income')}
        >
          <ArrowUpCircle size={16} />
          <span>Доход</span>
        </button>
      </div>

      {/* 2. Full-Width Account Selector Row */}
      <div className="account-select-row">
        <div className="account-select-label">Счёт операции:</div>
        <div className="account-select-wrapper">
          <CreditCard size={16} color={selectedAccount?.color || 'var(--accent-emerald)'} />
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="account-select-field"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} — {formatMoney(acc.balance, acc.currency)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="select-arrow" />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 3. Big Amount Input */}
        <div className="input-amount-container">
          <input
            type="number"
            step="any"
            placeholder="0"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="amount-input-big"
          />
          <span className="amount-currency-symbol">
            {CURRENCIES[selectedAccount?.currency || 'RUB']?.symbol}
          </span>
        </div>

        {/* 4. Quick Amount Presets */}
        <div className="amount-presets-row">
          {[100, 500, 1000, 3000, 5000].map((val) => (
            <button
              key={val}
              type="button"
              className="preset-pill"
              onClick={() => addPreset(val)}
            >
              +{val}
            </button>
          ))}
          {amount && (
            <button
              type="button"
              className="preset-pill reset"
              onClick={() => setAmount('')}
            >
              Сброс
            </button>
          )}
        </div>

        {/* 5. 3-TIER RATIONALITY SELECTOR (Only for Expenses) */}
        {txType === 'expense' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Оценка разумности траты:
            </div>
            <div className="rationality-selector">
              <button
                type="button"
                className={`rat-btn base ${rationalityTag === 'base' ? 'active' : ''}`}
                onClick={() => setRationalityTag('base')}
              >
                <div className="rat-btn-title">
                  <Shield size={14} color="#10b981" />
                  <span>Base</span>
                </div>
                <div className="rat-btn-sub">Обязательное</div>
              </button>

              <button
                type="button"
                className={`rat-btn joy ${rationalityTag === 'joy' ? 'active' : ''}`}
                onClick={() => setRationalityTag('joy')}
              >
                <div className="rat-btn-title">
                  <Sparkles size={14} color="#ffb703" />
                  <span>Joy</span>
                </div>
                <div className="rat-btn-sub">В радость</div>
              </button>

              <button
                type="button"
                className={`rat-btn impulse ${rationalityTag === 'impulse' ? 'active' : ''}`}
                onClick={() => setRationalityTag('impulse')}
              >
                <div className="rat-btn-title">
                  <AlertTriangle size={14} color="#ff3b5c" />
                  <span>Impulse</span>
                </div>
                <div className="rat-btn-sub">Неразумно</div>
              </button>
            </div>
          </div>
        )}

        {/* 6. Category Selection */}
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Категория:
        </div>
        <div className="categories-slider">
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-pill ${selectedCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                if (cat.defaultTag && txType === 'expense') {
                  setRationalityTag(cat.defaultTag);
                }
              }}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 7. Note / Comment */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Заметка к операции (необязательно)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', fontSize: '13px' }}
          />
        </div>

        {/* 8. Submit Button */}
        <button type="submit" className="btn-primary">
          <Check size={18} />
          <span>Записать {txType === 'expense' ? 'расход' : 'доход'}</span>
        </button>
      </form>
    </div>
  );
};
