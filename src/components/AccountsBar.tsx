import React, { useState } from 'react';
import { Account, AccountType, CurrencyCode } from '../types/finance';
import { CURRENCIES, convertCurrency, formatMoney } from '../services/currencyService';
import { Plus, ArrowRightLeft, CreditCard, Banknote, PiggyBank, Globe, Edit2, Trash2 } from 'lucide-react';

interface AccountsBarProps {
  accounts: Account[];
  primaryCurrency: CurrencyCode;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount?: (account: Account) => void;
  onDeleteAccount?: (id: string) => void;
  onTransfer: (fromId: string, toId: string, fromAmount: number, toAmount: number, note?: string) => void;
}

export const AccountsBar: React.FC<AccountsBarProps> = ({
  accounts,
  primaryCurrency,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onTransfer,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // New Account State
  const [newAccName, setNewAccName] = useState('');
  const [newAccBank, setNewAccBank] = useState('Т-Банк');
  const [newAccType, setNewAccType] = useState<AccountType>('debit');
  const [newAccCurrency, setNewAccCurrency] = useState<CurrencyCode>('RUB');
  const [newAccBalance, setNewAccBalance] = useState('0');
  const [newAccColor, setNewAccColor] = useState('#00e699');

  // Edit Account State
  const [editAccName, setEditAccName] = useState('');
  const [editAccBank, setEditAccBank] = useState('');
  const [editAccType, setEditAccType] = useState<AccountType>('debit');
  const [editAccCurrency, setEditAccCurrency] = useState<CurrencyCode>('RUB');
  const [editAccBalance, setEditAccBalance] = useState('0');
  const [editAccColor, setEditAccColor] = useState('#00e699');

  // Transfer State
  const [transferFromId, setTransferFromId] = useState(accounts[0]?.id || '');
  const [transferToId, setTransferToId] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTargetAmount, setTransferTargetAmount] = useState('');

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setEditAccName(acc.name);
    setEditAccBank(acc.bankName || '');
    setEditAccType(acc.type);
    setEditAccCurrency(acc.currency);
    setEditAccBalance(acc.balance.toString());
    setEditAccColor(acc.color || '#00e699');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editAccName) return;
    if (onUpdateAccount) {
      onUpdateAccount({
        ...editingAccount,
        name: editAccName,
        bankName: editAccBank,
        type: editAccType,
        currency: editAccCurrency,
        balance: parseFloat(editAccBalance) || 0,
        color: editAccColor,
      });
    }
    setShowEditModal(false);
    setEditingAccount(null);
  };

  const handleDelete = (acc: Account) => {
    if (accounts.length <= 1) {
      alert('Нельзя удалить единственный счёт. Добавьте другой счёт перед удалением этого.');
      return;
    }
    if (confirm(`Удалить счёт "${acc.name}"?`)) {
      if (onDeleteAccount) {
        onDeleteAccount(acc.id);
      }
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'savings': return <PiggyBank size={16} />;
      case 'cash': return <Banknote size={16} />;
      case 'crypto': return <Globe size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;

    onAddAccount({
      name: newAccName,
      bankName: newAccBank,
      type: newAccType,
      currency: newAccCurrency,
      balance: parseFloat(newAccBalance) || 0,
      color: newAccColor,
      icon: 'CreditCard',
    });

    setNewAccName('');
    setNewAccBalance('');
    setShowAddModal(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFromId || !transferToId || transferFromId === transferToId) return;
    const fromAmt = parseFloat(transferAmount);
    if (!fromAmt || fromAmt <= 0) return;

    const fromAcc = accounts.find((a) => a.id === transferFromId);
    const toAcc = accounts.find((a) => a.id === transferToId);
    if (!fromAcc || !toAcc) return;

    let toAmt = parseFloat(transferTargetAmount);
    if (!toAmt || isNaN(toAmt)) {
      toAmt = convertCurrency(fromAmt, fromAcc.currency, toAcc.currency);
    }

    onTransfer(transferFromId, transferToId, fromAmt, toAmt, `Перевод: ${fromAcc.name} → ${toAcc.name}`);
    setTransferAmount('');
    setTransferTargetAmount('');
    setShowTransferModal(false);
  };

  return (
    <section className="accounts-section">
      <div className="section-header">
        <span className="section-title">Счета и Кошельки ({accounts.length})</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="currency-badge"
            style={{ color: 'var(--accent-joy)', borderColor: 'rgba(255,183,3,0.3)', padding: '4px 10px' }}
            onClick={() => setShowTransferModal(true)}
            title="Перевод между своими счетами"
          >
            <ArrowRightLeft size={13} />
            <span>Перевод</span>
          </button>
        </div>
      </div>

      <div className="accounts-grid">
        {accounts.map((acc) => {
          const isDifferentCurrency = acc.currency !== primaryCurrency;
          const convertedBalance = isDifferentCurrency
            ? convertCurrency(acc.balance, acc.currency, primaryCurrency)
            : null;

          return (
            <div
              key={acc.id}
              className="account-card"
              style={{
                borderLeft: `4px solid ${acc.color}`,
              }}
            >
              <div className="account-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ color: acc.color, flexShrink: 0 }}>{getAccountIcon(acc.type)}</span>
                  <span className="account-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {acc.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(acc);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Редактировать счёт"
                  >
                    <Edit2 size={12} />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(acc);
                      }}
                      style={{
                        background: 'rgba(255, 59, 92, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        color: 'var(--accent-ruby)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Удалить счёт"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <div className="account-chip" style={{ color: acc.color }}>
                    {CURRENCIES[acc.currency]?.symbol}
                  </div>
                </div>
              </div>

              <div>
                <div className="account-balance">
                  {formatMoney(acc.balance, acc.currency)}
                </div>
                {convertedBalance !== null && (
                  <div className="account-sub">
                    ≈ {formatMoney(convertedBalance, primaryCurrency)}
                  </div>
                )}
                {acc.type === 'savings' && acc.interestRate && (
                  <div className="account-sub" style={{ color: 'var(--accent-joy)' }}>
                    {acc.interestRate}% годовых
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Account Card Button */}
        <button className="add-account-card" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          <span>Новый счёт</span>
        </button>
      </div>

      {/* MODAL: ADD ACCOUNT */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 800 }}>Добавить счёт / банк</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexFlow: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Название счёта / карты</label>
                <input
                  type="text"
                  required
                  placeholder="например, Т-Банк Black или Наличные USD"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Банк</label>
                  <select
                    value={newAccBank}
                    onChange={(e) => setNewAccBank(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="Т-Банк">Т-Банк</option>
                    <option value="Сбер">Сбер</option>
                    <option value="Альфа">Альфа-Банк</option>
                    <option value="Райф">Райффайзен</option>
                    <option value="Revolut">Revolut</option>
                    <option value="Сейф">Наличные / Сейф</option>
                    <option value="Крипто">Крипто-кошелек</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Тип счёта</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as AccountType)}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="debit">Дебетовая карта</option>
                    <option value="credit">Кредитная карта</option>
                    <option value="savings">Накопительный / Вклад</option>
                    <option value="cash">Наличные</option>
                    <option value="crypto">Крипто</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Валюта</label>
                  <select
                    value={newAccCurrency}
                    onChange={(e) => setNewAccCurrency(e.target.value as CurrencyCode)}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="RUB">RUB (₽)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USDT">USDT (₮)</option>
                    <option value="KZT">KZT (₸)</option>
                    <option value="GEL">GEL (₾)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Начальный баланс</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Фирменный цвет</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {['#00e699', '#ffdd2d', '#22c55e', '#38bdf8', '#a855f7', '#ff3b5c', '#f97316'].map((color) => (
                    <div
                      key={color}
                      onClick={() => setNewAccColor(color)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: newAccColor === color ? '3px solid #fff' : '2px solid transparent',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="cat-pill" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Отмена
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Создать счёт
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER BETWEEN ACCOUNTS */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 800 }}>Перевод между своими счетами</h2>
            <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexFlow: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Списать со счёта</label>
                <select
                  value={transferFromId}
                  onChange={(e) => setTransferFromId(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatMoney(a.balance, a.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Зачислить на счёт</label>
                <select
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} disabled={a.id === transferFromId}>
                      {a.name} ({formatMoney(a.balance, a.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Сумма списания</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0"
                  value={transferAmount}
                  onChange={(e) => {
                    setTransferAmount(e.target.value);
                    const fromAcc = accounts.find((a) => a.id === transferFromId);
                    const toAcc = accounts.find((a) => a.id === transferToId);
                    if (fromAcc && toAcc) {
                      const converted = convertCurrency(parseFloat(e.target.value) || 0, fromAcc.currency, toAcc.currency);
                      setTransferTargetAmount(converted ? converted.toFixed(2) : '');
                    }
                  }}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Сумма зачисления (по курсу конвертации)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Рассчитается автоматически или введите вручную"
                  value={transferTargetAmount}
                  onChange={(e) => setTransferTargetAmount(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="cat-pill" onClick={() => setShowTransferModal(false)} style={{ flex: 1 }}>
                  Отмена
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Выполнить перевод
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACCOUNT */}
      {showEditModal && editingAccount && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 800 }}>Редактировать счёт</h2>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexFlow: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Название счёта / карты</label>
                <input
                  type="text"
                  required
                  placeholder="например, Т-Банк Black или Наличные USD"
                  value={editAccName}
                  onChange={(e) => setEditAccName(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Банк / Организация</label>
                  <input
                    type="text"
                    value={editAccBank}
                    onChange={(e) => setEditAccBank(e.target.value)}
                    placeholder="Т-Банк, Сбер и т.д."
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Тип счёта</label>
                  <select
                    value={editAccType}
                    onChange={(e) => setEditAccType(e.target.value as AccountType)}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="debit">Дебетовая карта</option>
                    <option value="credit">Кредитная карта</option>
                    <option value="savings">Накопительный счёт</option>
                    <option value="cash">Наличные</option>
                    <option value="crypto">Крипто-кошелёк</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Валюта счёта</label>
                  <select
                    value={editAccCurrency}
                    onChange={(e) => setEditAccCurrency(e.target.value as CurrencyCode)}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="RUB">RUB (₽)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USDT">USDT (₮)</option>
                    <option value="KZT">KZT (₸)</option>
                    <option value="GEL">GEL (₾)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Текущий баланс</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={editAccBalance}
                    onChange={(e) => setEditAccBalance(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Цвет карты</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {['#ffdd2d', '#22c55e', '#00e699', '#38bdf8', '#a855f7', '#ec4899', '#f97316'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEditAccColor(col)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: col,
                        border: editAccColor === col ? '2px solid #fff' : '2px solid transparent',
                        cursor: 'pointer',
                        transform: editAccColor === col ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="cat-pill" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>
                  Отмена
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
