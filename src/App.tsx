import React, { useState, useEffect, useRef } from 'react';
import { Account, AppDataVault, CurrencyCode, Transaction, Achievement, PeriodBudget } from './types/finance';
import { loadVaultFromStorage, saveVaultToStorage, getInitialVault, clearVaultStorage, getDemoVault } from './services/storage';
import { calculateNetWorth, formatMoney } from './services/currencyService';
import { evaluateGamification } from './achievements/achievementEngine';
import { Header } from './components/Header';
import { AccountsBar } from './components/AccountsBar';
import { BudgetTzlvtCard } from './components/BudgetTzlvtCard';
import { BudgetModal } from './components/BudgetModal';
import { QuickExpenseInput } from './components/QuickExpenseInput';
import { DesktopDashboard } from './components/DesktopDashboard';
import { AchievementsView } from './components/AchievementsView';
import { AchievementsModal } from './components/AchievementsModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { AchievementToast } from './components/AchievementToast';
import { BottomNav, MobileTab } from './components/BottomNav';
import { Trash2 } from 'lucide-react';
import { Language, getTranslation, getLocalizedLevelTitle } from './services/i18n';
import { driveSync } from './services/googleDriveSync';

export const App: React.FC = () => {
  const [vault, setVault] = useState<AppDataVault>(() => loadVaultFromStorage());
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('input');
  const [isMobileScreen, setIsMobileScreen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Period Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetModalMode, setBudgetModalMode] = useState<'configure' | 'topup'>('configure');

  // Google Drive Continuous Auto-Sync State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // i18n language state (stored in localStorage)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('xpance_lang');
    return (saved === 'en' || saved === 'ru') ? saved : 'ru';
  });

  const t = getTranslation(lang);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('xpance_lang', newLang);
  };

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
    const stampedVault: AppDataVault = {
      ...newVault,
      lastUpdated: new Date().toISOString(),
    };

    if (checkAchievements) {
      const evalResult = evaluateGamification(stampedVault);
      const evaluatedVault: AppDataVault = {
        ...stampedVault,
        achievements: evalResult.updatedAchievements,
        gamification: evalResult.updatedGamification,
      };

      if (evalResult.newlyUnlocked.length > 0) {
        setToastAchievement(evalResult.newlyUnlocked[0]);
      }

      saveVaultToStorage(evaluatedVault);
      setVault(evaluatedVault);
    } else {
      saveVaultToStorage(stampedVault);
      setVault(stampedVault);
    }
  };

  // References for reliable background synchronization
  const vaultRef = useRef<AppDataVault>(vault);
  const lastSyncedVaultJsonRef = useRef<string>('');
  const isPullingRemoteRef = useRef<boolean>(false);

  useEffect(() => {
    vaultRef.current = vault;
  }, [vault]);

  // Continuous Auto-Sync: Initial pull from Google Drive on app launch
  useEffect(() => {
    let isMounted = true;
    const runInitialSync = async () => {
      try {
        const hasSession = await driveSync.restoreSession();
        if (hasSession && isMounted) {
          setSyncStatus('syncing');
          const remoteVault = await driveSync.downloadVault();
          if (remoteVault && remoteVault.accounts && remoteVault.accounts.length > 0) {
            const remoteTime = new Date(remoteVault.lastUpdated || 0).getTime();
            const localTime = new Date(vaultRef.current.lastUpdated || 0).getTime();
            if (remoteTime > localTime) {
              isPullingRemoteRef.current = true;
              saveVaultToStorage(remoteVault);
              setVault(remoteVault);
              lastSyncedVaultJsonRef.current = JSON.stringify(remoteVault);
              setTimeout(() => { isPullingRemoteRef.current = false; }, 500);
            } else if (localTime > remoteTime) {
              await driveSync.uploadVault(vaultRef.current);
              lastSyncedVaultJsonRef.current = JSON.stringify(vaultRef.current);
            } else {
              lastSyncedVaultJsonRef.current = JSON.stringify(remoteVault);
            }
          } else {
            // First time on Google Drive: upload local vault
            await driveSync.uploadVault(vaultRef.current);
            lastSyncedVaultJsonRef.current = JSON.stringify(vaultRef.current);
          }
          if (isMounted) setSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
        if (isMounted) setSyncStatus('idle');
      }
    };

    runInitialSync();
    return () => {
      isMounted = false;
    };
  }, []);

  // Continuous Auto-Sync: Auto-pull when switching tabs or focusing window (multi-device sync)
  useEffect(() => {
    let lastCheckTime = 0;
    const checkRemoteUpdates = async () => {
      if (!driveSync.isAuthorized() || isPullingRemoteRef.current) return;
      const now = Date.now();
      if (now - lastCheckTime < 8000) return; // Debounce checks
      lastCheckTime = now;

      try {
        const remoteDetails = await driveSync.findVaultFileDetails();
        if (!remoteDetails) return;

        const remoteModTime = new Date(remoteDetails.modifiedTime).getTime();
        const lastLocalSync = typeof localStorage !== 'undefined' ? localStorage.getItem('xpance_last_synced_at') : null;
        const lastLocalSyncTime = lastLocalSync ? new Date(lastLocalSync).getTime() : 0;

        // If file on Drive is newer than last local sync
        if (remoteModTime > lastLocalSyncTime + 2000) {
          setSyncStatus('syncing');
          const remoteVault = await driveSync.downloadVault();
          if (remoteVault && remoteVault.accounts && remoteVault.accounts.length > 0) {
            const remoteTime = new Date(remoteVault.lastUpdated || 0).getTime();
            const localTime = new Date(vaultRef.current.lastUpdated || 0).getTime();

            if (remoteTime > localTime) {
              isPullingRemoteRef.current = true;
              saveVaultToStorage(remoteVault);
              setVault(remoteVault);
              lastSyncedVaultJsonRef.current = JSON.stringify(remoteVault);
              setTimeout(() => { isPullingRemoteRef.current = false; }, 500);
            }
          }
          setSyncStatus('synced');
        }
      } catch (e) {
        console.warn('Auto background pull check error:', e);
      }
    };

    const onFocusOrVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkRemoteUpdates();
      }
    };

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);
    const interval = setInterval(checkRemoteUpdates, 35000);

    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      clearInterval(interval);
    };
  }, []);

  // Continuous Auto-Sync: Auto-push changes to Google Drive in background (debounced 1.5s)
  useEffect(() => {
    if (!driveSync.isAuthorized() || isPullingRemoteRef.current) return;

    const currentJson = JSON.stringify(vault);
    if (currentJson === lastSyncedVaultJsonRef.current) {
      return;
    }

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        await driveSync.uploadVault(vault);
        lastSyncedVaultJsonRef.current = JSON.stringify(vault);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Auto upload to Google Drive failed:', err);
        setSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [vault]);

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

  // Save or Update Period Budget
  const handleSaveBudget = (newBudget: PeriodBudget) => {
    const newVault: AppDataVault = {
      ...vault,
      budget: newBudget,
    };
    updateVault(newVault);
  };

  // Top Up Period Budget
  const handleTopUpBudget = (amount: number, note?: string) => {
    if (!vault.budget) return;
    const topUp = {
      id: `topup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      amount,
      date: new Date().toISOString(),
      note,
    };
    const currentTopUps = vault.budget.topUps || [];
    const updatedBudget: PeriodBudget = {
      ...vault.budget,
      topUps: [...currentTopUps, topUp],
    };
    const newVault: AppDataVault = {
      ...vault,
      budget: updatedBudget,
    };
    updateVault(newVault);
  };

  // Delete Period Budget
  const handleDeleteBudget = () => {
    const newVault: AppDataVault = { ...vault };
    delete newVault.budget;
    updateVault(newVault);
  };

  const handleOpenConfigureBudget = () => {
    setBudgetModalMode('configure');
    setIsBudgetModalOpen(true);
  };

  const handleOpenTopUpBudget = () => {
    setBudgetModalMode('topup');
    setIsBudgetModalOpen(true);
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
        levelTitle={getLocalizedLevelTitle(vault.gamification.level, lang)}
        streakDays={vault.gamification.currentStreakDays}
        onOpenAchievements={() => {
          if (isMobile) {
            setActiveMobileTab('achievements');
          } else {
            setIsAchievementsOpen(true);
          }
        }}
        onOpenSync={() => setIsSyncModalOpen(true)}
        isSyncConfigured={driveSync.isAuthorized() || Boolean(vault.syncConfig?.clientId)}
        syncStatus={syncStatus}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />

      {isMobile ? (
        /* MOBILE VIEW (Samsung Galaxy S24 Ultra & all phones) */
        <main className="mobile-main-content">
          {/* TAB 1: QUICK INPUT */}
          {activeMobileTab === 'input' && (
            <>
              <BudgetTzlvtCard
                budget={vault.budget}
                transactions={vault.transactions}
                primaryCurrency={vault.primaryCurrency}
                lang={lang}
                onOpenBudgetModal={handleOpenConfigureBudget}
                onOpenTopUpModal={handleOpenTopUpBudget}
              />

              <QuickExpenseInput
                accounts={vault.accounts}
                categories={vault.categories}
                onAddTransaction={handleAddTransaction}
                lang={lang}
              />

              {/* Recent Transactions List on Mobile Input Screen */}
              <div className="glass-card" style={{ padding: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  {t.recentTransactions}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {vault.transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '18px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {t.emptyDbPrompt}
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
                        tagBadge = <span style={{ fontSize: '9px', color: '#ff3b5c', background: 'rgba(255, 59, 92, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>{t.tagImpulseTitle}</span>;
                      } else if (tx.rationalityTag === 'joy') {
                        tagBadge = <span style={{ fontSize: '9px', color: '#ffb703', background: 'rgba(255, 183, 3, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>{t.tagJoyTitle}</span>;
                      } else {
                        tagBadge = <span style={{ fontSize: '9px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>{t.tagBaseTitle}</span>;
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
                            <span>{cat?.name || (lang === 'ru' ? 'Перевод' : 'Transfer')}</span>
                            {tagBadge}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {acc?.name} • {new Date(tx.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
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
                            title={t.deleteTxConfirm}
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
              lang={lang}
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
              lang={lang}
            />
          )}

          {/* TAB 4: ACHIEVEMENTS HALL */}
          {activeMobileTab === 'achievements' && (
            <AchievementsView
              achievements={vault.achievements}
              gamification={vault.gamification}
              lang={lang}
            />
          )}

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav
            activeTab={activeMobileTab}
            onTabChange={setActiveMobileTab}
            streakDays={vault.gamification.currentStreakDays}
            lang={lang}
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
            lang={lang}
          />

          <BudgetTzlvtCard
            budget={vault.budget}
            transactions={vault.transactions}
            primaryCurrency={vault.primaryCurrency}
            lang={lang}
            onOpenBudgetModal={handleOpenConfigureBudget}
            onOpenTopUpModal={handleOpenTopUpBudget}
          />

          <QuickExpenseInput
            accounts={vault.accounts}
            categories={vault.categories}
            onAddTransaction={handleAddTransaction}
            lang={lang}
          />

          <DesktopDashboard
            transactions={vault.transactions}
            accounts={vault.accounts}
            categories={vault.categories}
            primaryCurrency={vault.primaryCurrency}
            gamification={vault.gamification}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            lang={lang}
          />
        </main>
      )}

      {/* Desktop Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={vault.achievements}
        gamification={vault.gamification}
        lang={lang}
      />

      <GoogleDriveSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        vault={vault}
        onVaultImported={(imported) => updateVault(imported)}
        onClearDatabase={handleClearDatabase}
        onLoadDemo={handleLoadDemo}
        onResetToDemo={handleClearDatabase}
        lang={lang}
      />

      <AchievementToast
        achievement={toastAchievement}
        onDismiss={() => setToastAchievement(null)}
      />

      {/* Tzlvt Period Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budget={vault.budget}
        primaryCurrency={vault.primaryCurrency}
        lang={lang}
        initialMode={budgetModalMode}
        onSaveBudget={handleSaveBudget}
        onTopUpBudget={handleTopUpBudget}
        onDeleteBudget={handleDeleteBudget}
      />
    </div>
  );
};

export default App;
