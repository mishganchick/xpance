import React from 'react';
import { Achievement, UserGamification } from '../types/finance';
import { calculateLevelInfo } from '../achievements/achievementEngine';
import { Trophy, X, Flame, Shield, ShieldCheck, Globe, PiggyBank, ArrowRightLeft, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';
import { Language, getTranslation, getAchievementText, getLocalizedLevelTitle } from '../services/i18n';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  gamification: UserGamification;
  lang?: Language;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  gamification,
  lang = 'ru',
}) => {
  if (!isOpen) return null;

  const t = getTranslation(lang);
  const levelInfo = calculateLevelInfo(gamification.xp);
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const levelTitle = getLocalizedLevelTitle(gamification.level, lang);

  const getAchIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { size: 22, color: isUnlocked ? '#1e1302' : 'var(--text-muted)' };
    switch (iconName) {
      case 'Shield': return <Shield {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'PiggyBank': return <PiggyBank {...props} />;
      case 'ArrowRightLeft': return <ArrowRightLeft {...props} />;
      case 'TrendingDown': return <TrendingDown {...props} />;
      case 'CheckCircle2': return <CheckCircle2 {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ffb703 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trophy size={20} color="#150f02" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{t.achievementsHallTitle}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lang === 'ru'
                  ? `Разблокировано ${unlockedCount} из ${achievements.length} достижений`
                  : `Unlocked ${unlockedCount} of ${achievements.length} trophies`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Level Progression Card */}
        <div
          style={{
            padding: '18px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,183,3,0.12) 0%, rgba(255,59,92,0.06) 100%)',
            border: '1px solid rgba(255,183,3,0.25)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#0a0d12',
                  border: '1px solid rgba(123, 97, 255, 0.4)',
                  boxShadow: '0 0 15px rgba(123, 97, 255, 0.35)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="./mascot.png"
                  alt="XPance Mascot"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-joy)', fontWeight: 800 }}>
                  {lang === 'ru' ? 'Текущий ранг' : 'Current Rank'}
                </span>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                  {levelTitle}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-joy)' }}>
                {gamification.xp} XP
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {t.progressToLevel.replace('{nextLevel}', (levelInfo.level + 1).toString())}: {levelInfo.xpForNext - levelInfo.xpCurrent} XP
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${levelInfo.progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ffb703 0%, #00e699 100%)',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* List of achievements */}
        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {achievements.map((ach) => {
            const text = getAchievementText(ach.id, ach.title, ach.description, lang);
            return (
              <div
                key={ach.id}
                className={`achievement-card ${ach.isUnlocked ? 'unlocked' : ''}`}
              >
                <div className="ach-icon-box">
                  {getAchIcon(ach.icon, ach.isUnlocked)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: ach.isUnlocked ? '#fff' : 'var(--text-secondary)' }}>
                      {text.title}
                    </div>
                    {ach.isUnlocked && (
                      <span style={{ fontSize: '10px', background: 'rgba(255,183,3,0.2)', color: '#ffb703', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {t.unlocked}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {text.desc}
                  </div>

                  {!ach.isUnlocked && ach.targetCount > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.round((ach.currentProgress / ach.targetCount) * 100))}%`,
                            height: '100%',
                            background: 'var(--accent-emerald)',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {ach.currentProgress} / {ach.targetCount}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', minWidth: '70px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: ach.isUnlocked ? 'var(--accent-joy)' : 'var(--text-muted)',
                    }}
                  >
                    +{ach.rewardXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
