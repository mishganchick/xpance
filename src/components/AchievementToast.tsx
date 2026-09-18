import React, { useEffect } from 'react';
import { Achievement } from '../types/finance';
import confetti from 'canvas-confetti';
import { Trophy, X } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    if (achievement) {
      // Trigger golden confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.8, x: 0.85 },
          colors: ['#ffb703', '#00e699', '#ff3b5c', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback if canvas is not mounted
      }

      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className="achievement-toast">
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ffb703 0%, #f59e0b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(255, 183, 3, 0.4)',
        }}
      >
        <Trophy size={24} color="#150f02" />
      </div>

      <div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-joy)', fontWeight: 800 }}>
          🎉 Новое достижение разблокировано!
        </div>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
          {achievement.title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {achievement.description} (+{achievement.rewardXp} XP)
        </div>
      </div>

      <button onClick={onDismiss} style={{ color: 'var(--text-muted)', padding: '4px', marginLeft: '8px' }}>
        <X size={16} />
      </button>
    </div>
  );
};
