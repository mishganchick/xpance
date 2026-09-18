import React from 'react';
import { Achievement, UserGamification } from '../types/finance';
import { calculateLevelInfo } from '../achievements/achievementEngine';
import { Trophy, Flame, Shield, ShieldCheck, Globe, PiggyBank, ArrowRightLeft, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';

interface AchievementsViewProps {
  achievements: Achievement[];
  gamification: UserGamification;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements, gamification }) => {
  const levelInfo = calculateLevelInfo(gamification.xp);
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  const getAchIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { size: 20, color: isUnlocked ? '#1e1302' : 'var(--text-muted)' };
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
    <div style={{ width: '100%' }}>
      {/* 1. Hero Rank Card */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.12) 0%, rgba(255, 59, 92, 0.08) 100%)',
          border: '1px solid rgba(255, 183, 3, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ffb703 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(255, 183, 3, 0.35)',
              }}
            >
              <Trophy size={26} color="#150f02" />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-joy)', fontWeight: 800 }}>
                Ранг героя
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                {gamification.levelTitle}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-joy)' }}>
              {gamification.xp} XP
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Уровень {gamification.level}
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Прогресс уровня</span>
            <span>{levelInfo.progressPercent}% ({levelInfo.xpCurrent} / {levelInfo.xpForNext} XP)</span>
          </div>
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

        {/* Streak Pill */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 183, 3, 0.08)',
            border: '1px solid rgba(255, 183, 3, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-joy)' }}>
            <Flame size={16} />
            <span>Стрик осознанности</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent-joy)' }}>
            🔥 {gamification.currentStreakDays} {gamification.currentStreakDays === 1 ? 'день' : 'дней'}
          </div>
        </div>
      </div>

      {/* 2. Achievements List */}
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <span className="section-title">
          Трофеи ({unlockedCount} из {achievements.length})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`achievement-card ${ach.isUnlocked ? 'unlocked' : ''}`}
            style={{ padding: '14px', borderRadius: '14px', margin: 0 }}
          >
            <div className="ach-icon-box">
              {getAchIcon(ach.icon, ach.isUnlocked)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: ach.isUnlocked ? '#fff' : 'var(--text-secondary)' }}>
                  {ach.title}
                </div>
                {ach.isUnlocked && (
                  <span style={{ fontSize: '9px', background: 'rgba(255,183,3,0.2)', color: '#ffb703', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                    ОТКРЫТО
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>
                {ach.description}
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

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
        ))}
      </div>
    </div>
  );
};
