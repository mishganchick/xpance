import React from 'react';
import { PlusCircle, CreditCard, PieChart, Trophy } from 'lucide-react';

export type MobileTab = 'input' | 'accounts' | 'radar' | 'achievements';

interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  streakDays: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, streakDays }) => {
  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'input' ? 'active' : ''}`}
        onClick={() => onTabChange('input')}
      >
        <PlusCircle size={20} />
        <span>Ввод</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
        onClick={() => onTabChange('accounts')}
      >
        <CreditCard size={20} />
        <span>Счета</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'radar' ? 'active' : ''}`}
        onClick={() => onTabChange('radar')}
      >
        <PieChart size={20} />
        <span>Радар</span>
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
        <span>Ачивки</span>
      </button>
    </nav>
  );
};
