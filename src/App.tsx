import React, { useState, useEffect } from 'react';
import { Account, AppDataVault, CurrencyCode, Transaction, Achievement } from './types/finance';
import { loadVaultFromStorage, saveVaultToStorage, getInitialVault, clearVaultStorage, getDemoVault } from './services/storage';
import { calculateNetWorth, formatMoney } from './services/currencyService';
import { evaluateGamification } from './achievements/achievementEngine';
import { Header } from './components/Header';
import { AccountsBar } from './components/AccountsBar';
import { QuickExpenseInput } from './components/QuickExpenseInput';
import { DesktopDashboard } from './components/DesktopDashboard';
import { AchievementsView } from './components/AchievementsView';
import { AchievementsModal } from './components/AchievementsModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { AchievementToast } from './components/AchievementToast';
import { BottomNav, MobileTab } from './components/BottomNav';
import { Trash2 } from 'lucide-react';

export const App: React.FC = () => {
  const [vault, setVault] = useState<AppDataVault>(() => loadVaultFromStorage());
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('input');
  const [isMobileScreen, setIsMobileScreen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Auto-detect screen size and PWA install prompt
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Auto-save vault and re-evaluate gamification when transactions/accounts change
  const updateVault = (newVault: AppDataVault, checkAchievements = true) => {
    if (checkAchievements) {
      const evalResult = evaluateGamification(newVault);
      const evaluatedVault: AppDataVault = {
        ...newVault,
        achievements: evalResult.updatedAchievements,
        gamification: evalResult.updatedGamification,
      };

      if (evalResult.newlyUnlocked.length > 0) {
        setToastAchievement(evalResult.newlyUnlocked[0]);
      }

      saveVaultToStorage(evaluatedVault);
      setVault(evaluatedVault);
    } else {
      saveVaultToStorage(newVault);
      setVault(newVault);
    }
  };

  // Add Transaction
  const handleAddTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    const updatedAccounts = vault.accounts.map((acc) => {
      if (acc.id === newTx.accountId) {
        let newBalance = acc.balance;
        if (newTx.type === 'expense') {
          newBalance -= newTx.amount;
        } else if (newTx.type === 'income') {
          newBalance += newTx.amount;
        }
        return { ...acc, balance: newBalance };
      }
      return acc;
    });

    const newVault: AppDataVault = {
      ...vault,
      accounts: updatedAccounts,
      transactions: [newTx, ...vault.transactions],
    };

    updateVault(newVault);
  };

  // Add Account
  const handleAddAccount = (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    const newVault: AppDataVault = {
      ...vault,
      accounts: [...vault.accounts, newAcc],
    };

    updateVault(newVault);
  };

  // Update Account
  const handleUpdateAccount = (updatedAccount: Account) => {
    const updatedAccounts = vault.accounts.map((acc) =>
      acc.id === updatedAccount.id ? updatedAccount : acc
    );
    updateVault({ ...vault, accounts: updatedAccounts });
  };

  // Delete Account
  const handleDeleteAccount = (id: string) => {
    if (vault.accounts.length <= 1) {
      alert('Нельзя удалить единственный счёт. Добавьте другой счёт перед удалением этого.');
      return;
    }
    const updatedAccounts = vault.accounts.filter((acc) => acc.id !== id);
    updateVault({ ...vault, accounts: updatedAccounts });
  };

  // Clear Database (Fresh clean state)
  const handleClearDatabase = () => {
    const cleanVault = clearVaultStorage();
    setVault(cleanVault);
  };

  // Load Demo Data
  const handleLoadDemo = () => {
    const demoVault = getDemoVault();
    saveVaultToStorage(demoVault);
    setVault(demoVault);
  };

  // Transfer Between Accounts
  const handleTransfer = (
    fromId: string,
    toId: string,
    fromAmount: number,
    toAmount: number,
    note?: string
  ) => {
    const updatedAccounts = vault.accounts.map((acc) => {
      if (acc.id === fromId) {
        return { ...acc, balance: acc.balance - fromAmount };
      }
      if (acc.id === toId) {
        return { ...acc, balance: acc.balance + toAmount };
      }
      return acc;
    });

    const fromAcc = vault.accounts.find((a) => a.id === fromId);
    const toAcc = vault.accounts.find((a) => a.id === toId);

    const transferTx: Transaction = {
      id: `transfer_${Date.now()}`,
      amount: fromAmount,
      currency: fromAcc ? fromAcc.currency : 'RUB',
      type: 'transfer',
      accountId: fromId,
      toAccountId: toId,
      date: new Date().toISOString(),
      note: note || `Перевод: ${fromAcc?.name} → ${toAcc?.name} (${toAmount} ${toAcc?.currency})`,
    };

    const newVault: AppDataVault = {
      ...vault,
      accounts: updatedAccounts,
      transactions: [transferTx, ...vault.transactions],
    };

    updateVault(newVault);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const txToDelete = vault.transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    const updatedAccounts = vault.accounts.map((acc) => {
      if (acc.id === txToDelete.accountId) {
        let rolledBalance = acc.balance;
        if (txToDelete.type === 'expense') {
          rolledBalance += txToDelete.amount;
        } else if (txToDelete.type === 'income') {
          rolledBalance -= txToDelete.amount;
        }
        return { ...acc, balance: rolledBalance };
      }
      return acc;
    });

    const newVault: AppDataVault = {
      ...vault,
      accounts: updatedAccounts,
      transactions: vault.transactions.filter((t) => t.id !== id),
    };

    updateVault(newVault);
  };

  // Currency Change
  const handleCurrencyChange = (cur: CurrencyCode) => {
    const newVault: AppDataVault = {
      ...vault,
      primaryCurrency: cur,
    };
    updateVault(newVault, false);
  };

  // Calculate Net Worth
  const netWorth = calculateNetWorth(vault.accounts, vault.primaryCurrency);
  const isMobile = isMobileScreen || viewMode === 'mobile';

  return (
    <div className={`app-wrapper ${isMobile ? 'mobile-mode' : 'desktop-mode'}`}>
      <Header
        netWorth={netWorth}
        primaryCurrency={vault.primaryCurrency}
        onCurrencyChange={handleCurrencyChange}
        level={vault.gamification.level}
        levelTitle={vault.gamification.levelTitle}
        streakDays={vault.gamification.currentStreakDays}
        onOpenAchievements={() => {
          if (isMobile) {
            setActiveMobileTab('achievements');
          } else {
            setIsAchievementsOpen(true);
          }
        }}
        onOpenSync={() => setIsSyncModalOpen(true)}
        isSyncConfigured={vault.syncConfig.isSignedIn || Boolean(vault.syncConfig.clientId)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {isMobile ? (
        /* MOBILE VIEW (Samsung Galaxy S24 Ultra & all phones) */
        <main className="mobile-main-content">
          {/* TAB 1: QUICK INPUT */}
          {activeMobileTab === 'input' && (
            <>
              <QuickExpenseInput
                accounts={vault.accounts}
                categories={vault.categories}
                onAddTransaction={handleAddTransaction}
              />

              {/* Recent Transactions List on Mobile Input Screen */}
              <div className="glass-card" style={{ padding: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  Последние операции
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {vault.transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '18px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      🌱 База данных пустая. Внесите свой первый расход или доход выше!
                    </div>
                  ) : (
                    vault.transactions.slice(0, 4).map((tx) => {
                    const acc = vault.accounts.find((a) => a.id === tx.accountId);
                    const cat = vault.categories.find((c) => c.id === tx.categoryId);
                    const isExpense = tx.type === 'expense';
                    const isIncome = tx.type === 'income';

                    let tagBadge = null;
                    if (isExpense) {
                      if (tx.rationalityTag === 'impulse') {
                        tagBadge = <span style={{ fontSize: '9px', color: '#ff3b5c', background: 'rgba(255, 59, 92, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>⚠️ Импульс</span>;
                      } else if (tx.rationalityTag === 'joy') {
                        tagBadge = <span style={{ fontSize: '9px', color: '#ffb703', background: 'rgba(255, 183, 3, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>✨ В радость</span>;
                      } else {
                        tagBadge = <span style={{ fontSize: '9px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>🌿 База</span>;
                      }
                    }

                    return (
                      <div
                        key={tx.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{cat?.name || 'Перевод'}</span>
                            {tagBadge}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {acc?.name} • {new Date(tx.date).toLocaleDateString('ru-RU')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            style={{ color: 'var(--text-muted)', padding: '4px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  }))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ACCOUNTS (VERTICAL COLUMN) */}
          {activeMobileTab === 'accounts' && (
            <AccountsBar
              accounts={vault.accounts}
              primaryCurrency={vault.primaryCurrency}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              onTransfer={handleTransfer}
            />
          )}

          {/* TAB 3: RADAR & LEDGER */}
          {activeMobileTab === 'radar' && (
            <DesktopDashboard
              transactions={vault.transactions}
              accounts={vault.accounts}
              categories={vault.categories}
              primaryCurrency={vault.primaryCurrency}
              gamification={vault.gamification}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAchievements={() => setActiveMobileTab('achievements')}
              hideGamificationWidget={true}
            />
          )}

          {/* TAB 4: ACHIEVEMENTS HALL */}
          {activeMobileTab === 'achievements' && (
            <AchievementsView
              achievements={vault.achievements}
              gamification={vault.gamification}
            />
          )}

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav
            activeTab={activeMobileTab}
            onTabChange={setActiveMobileTab}
            streakDays={vault.gamification.currentStreakDays}
          />
        </main>
      ) : (
        /* DESKTOP FULL DASHBOARD LAYOUT */
        <main>
          <AccountsBar
            accounts={vault.accounts}
            primaryCurrency={vault.primaryCurrency}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onTransfer={handleTransfer}
          />

          <QuickExpenseInput
            accounts={vault.accounts}
            categories={vault.categories}
            onAddTransaction={handleAddTransaction}
          />

          <DesktopDashboard
            transactions={vault.transactions}
            accounts={vault.accounts}
            categories={vault.categories}
            primaryCurrency={vault.primaryCurrency}
            gamification={vault.gamification}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
          />
        </main>
      )}

      {/* Desktop Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={vault.achievements}
        gamification={vault.gamification}
      />

      <GoogleDriveSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        vault={vault}
        onVaultImported={(imported) => updateVault(imported)}
        onClearDatabase={handleClearDatabase}
        onLoadDemo={handleLoadDemo}
        onResetToDemo={handleClearDatabase}
      />

      <AchievementToast
        achievement={toastAchievement}
        onDismiss={() => setToastAchievement(null)}
      />
    </div>
  );
};

export default App;
