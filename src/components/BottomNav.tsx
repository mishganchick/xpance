import { PlusCircle, CreditCard, PieChart, Trophy } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

export type MobileTab = 'input' | 'accounts' | 'radar' | 'achievements';

interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  streakDays: number;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, streakDays, lang }) => {
  const t = getTranslation(lang);
  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'input' ? 'active' : ''}`}
        onClick={() => onTabChange('input')}
      >
        <PlusCircle size={20} />
        <span>{t.tabInput}</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
        onClick={() => onTabChange('accounts')}
      >
        <CreditCard size={20} />
        <span>{t.tabAccounts}</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'radar' ? 'active' : ''}`}
        onClick={() => onTabChange('radar')}
      >
        <PieChart size={20} />
        <span>{t.tabRadar}</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
        onClick={() => onTabChange('achievements')}
      >
        <div style={{ position: 'relative' }}>
          <Trophy size={20} />
          {streakDays > 0 && (
            <span className="bottom-nav-badge">🔥</span>
          )}
        </div>
        <span>{t.tabAchievements}</span>
      </button>
    </nav>
  );
};
