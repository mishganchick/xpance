import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, ExternalLink, Sparkles, Zap, Target, Trophy, ArrowRight, Share2, PlusSquare, Download, Layers } from 'lucide-react';
import { Language } from '../services/i18n';
import { PeriodBudget } from '../types/finance';
import { calculateBudgetMetrics } from '../services/budgetService';
import { formatMoney } from '../services/currencyService';

interface PhoneWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: PeriodBudget;
  transactions?: any[];
  onInstallClick?: () => void;
  hasInstallPrompt?: boolean;
  lang?: Language;
}

export const PhoneWidgetModal: React.FC<PhoneWidgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  transactions = [],
  onInstallClick,
  hasInstallPrompt = false,
  lang = 'ru',
}) => {
  // Default to Android as requested by user
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [androidTab, setAndroidTab] = useState<'shortcuts' | 'install' | 'kwgt'>('shortcuts');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const metrics = budget ? calculateBudgetMetrics(budget, transactions) : null;
  const dailyFormatted = metrics ? formatMoney(metrics.dailyAllowanceToday, budget?.currency || 'RUB') : '2 500 ₽';
  const remainingFormatted = metrics ? formatMoney(metrics.remainingBudget, budget?.currency || 'RUB') : '45 000 ₽';

  const liveAppUrl = 'https://mishganchick.github.io/xpance/?action=add_expense';

  const scriptableCode = `// 🐙 XPance - iOS Homescreen Widget (Scriptable)
// https://mishganchick.github.io/xpance/

const APP_URL = "https://mishganchick.github.io/xpance/?action=add_expense";
const MASCOT_URL = "https://mishganchick.github.io/xpance/mascot.png";

const widget = new ListWidget();
widget.backgroundColor = new Color("#0a0d12");
widget.url = APP_URL;

const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [new Color("#131a26"), new Color("#080b10")];
widget.backgroundGradient = gradient;

// Header
const header = widget.addStack();
header.centerAlignContent();

const req = new Request(MASCOT_URL);
try {
  const img = await req.loadImage();
  const mascot = header.addImage(img);
  mascot.imageSize = new Size(26, 26);
  mascot.cornerRadius = 7;
} catch (e) {}

header.addSpacer(8);
const title = header.addText("XPANCE");
title.textColor = new Color("#00e699");
title.font = Font.boldSystemFont(13);

widget.addSpacer(6);

// Budget Info
const label = widget.addText("Дневной лимит:");
label.textColor = new Color("#94a3b8");
label.font = Font.systemFont(11);

widget.addSpacer(2);
const amount = widget.addText("${dailyFormatted}");
amount.textColor = new Color("#ffffff");
amount.font = Font.heavySystemFont(19);

widget.addSpacer(6);
const footer = widget.addText("➕ Записать расход ➔");
footer.textColor = new Color("#ffb703");
footer.font = Font.semiboldSystemFont(10);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentSmall();
}
Script.complete();`;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(scriptableCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(liveAppUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00e699 0%, #00b4d8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 230, 153, 0.35)',
              }}
            >
              <Smartphone size={20} color="#051410" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
                {lang === 'ru' ? 'Виджет на телефон' : 'Phone Widget'}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lang === 'ru' ? 'Быстрый ввод трат и виджет на рабочем столе' : 'Homescreen widgets and quick expense actions'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Platform Switcher (Android / iOS) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '16px',
          }}
        >
          <button
            onClick={() => setPlatform('android')}
            style={{
              padding: '9px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: platform === 'android' ? 'linear-gradient(135deg, #00e699 0%, #00b4d8 100%)' : 'transparent',
              color: platform === 'android' ? '#051410' : 'var(--text-secondary)',
              boxShadow: platform === 'android' ? '0 0 15px rgba(0, 230, 153, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🤖 Android</span>
          </button>

          <button
            onClick={() => setPlatform('ios')}
            style={{
              padding: '9px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: platform === 'ios' ? 'linear-gradient(135deg, #7b61ff 0%, #00b4d8 100%)' : 'transparent',
              color: platform === 'ios' ? '#fff' : 'var(--text-secondary)',
              boxShadow: platform === 'ios' ? '0 0 15px rgba(123, 97, 255, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🍏 iPhone / iOS</span>
          </button>
        </div>

        {/* Realistic Widget Mockup Preview */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(0, 230, 153, 0.08) 0%, rgba(123, 97, 255, 0.06) 100%)',
            border: '1px solid rgba(0, 230, 153, 0.25)',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px' }}>
            {lang === 'ru' ? 'Как выглядит виджет на рабочем столе:' : 'Homescreen Widget Preview:'}
          </div>

          {/* Android / iOS Widget Mockup */}
          <div
            style={{
              width: '168px',
              height: '168px',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, #131a26 0%, #080b10 100%)',
              border: '1.5px solid rgba(0, 230, 153, 0.4)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 230, 153, 0.2)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Widget Top Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  background: '#0a0d12',
                  border: '1px solid rgba(123, 97, 255, 0.5)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img src="./mascot.png" alt="Mascot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#00e699', letterSpacing: '0.5px' }}>
                XPANCE
              </span>
            </div>

            {/* Widget Middle: Daily Budget */}
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                {lang === 'ru' ? 'На день:' : 'Daily Limit:'}
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', margin: '2px 0' }}>
                {dailyFormatted}
              </div>
              <div style={{ fontSize: '9px', color: '#00e699' }}>
                {lang === 'ru' ? `Остаток: ${remainingFormatted}` : `Left: ${remainingFormatted}`}
              </div>
            </div>

            {/* Widget Footer */}
            <div
              style={{
                fontSize: '9px',
                color: '#ffb703',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>{lang === 'ru' ? '➕ Внести расход ➔' : '➕ Add Expense ➔'}</span>
            </div>
          </div>
        </div>

        {/* ================= ANDROID SECTION ================= */}
        {platform === 'android' && (
          <div>
            {/* Sub-tabs for Android */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '6px',
                marginBottom: '14px',
              }}
            >
              <button
                onClick={() => setAndroidTab('shortcuts')}
                style={{
                  padding: '7px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: androidTab === 'shortcuts' ? 'rgba(0, 230, 153, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: androidTab === 'shortcuts' ? '#00e699' : 'var(--text-secondary)',
                  borderBottom: androidTab === 'shortcuts' ? '2px solid #00e699' : 'none',
                }}
              >
                1. Выносные кнопки
              </button>
              <button
                onClick={() => setAndroidTab('install')}
                style={{
                  padding: '7px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: androidTab === 'install' ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: androidTab === 'install' ? '#00d9ff' : 'var(--text-secondary)',
                  borderBottom: androidTab === 'install' ? '2px solid #00d9ff' : 'none',
                }}
              >
                2. Установка PWA
              </button>
              <button
                onClick={() => setAndroidTab('kwgt')}
                style={{
                  padding: '7px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: androidTab === 'kwgt' ? 'rgba(123, 97, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: androidTab === 'kwgt' ? '#c4b5fd' : 'var(--text-secondary)',
                  borderBottom: androidTab === 'kwgt' ? '2px solid #a78bfa' : 'none',
                }}
              >
                3. Виджет KWGT
              </button>
            </div>

            {/* ANDROID METHOD 1: PINNED SHORTCUTS (The native Android superpower!) */}
            {androidTab === 'shortcuts' && (
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                <div
                  style={{
                    background: 'rgba(0, 230, 153, 0.08)',
                    border: '1px solid rgba(0, 230, 153, 0.3)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '14px',
                  }}
                >
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#00e699', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} />
                    <span>Главная фишка Android: Любое действие можно вынести на экран!</span>
                  </h4>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', margin: '0 0 10px' }}>
                    В Android (Samsung, Pixel, Xiaomi, Honor и др.) вы можете превратить быстрые действия приложения в отдельные кнопки-виджеты на рабочем столе:
                  </p>
                  <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#cbd5e1' }}>
                    <li>
                      Убедитесь, что XPance установлен на экран телефона (в Chrome нажмите три точки ➔ <strong>«Установить приложение»</strong>).
                    </li>
                    <li>
                      Найдите иконку XPance с маскотом на рабочем столе и <strong>зажмите её пальцем на 1 секунду</strong>.
                    </li>
                    <li>
                      Появится меню быстрых действий:
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '6px 0' }}>
                        <span style={{ background: 'rgba(0, 230, 153, 0.2)', color: '#00e699', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>⚡ Внести расход</span>
                        <span style={{ background: 'rgba(255, 183, 3, 0.2)', color: '#ffb703', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>🎯 Дневной бюджет</span>
                        <span style={{ background: 'rgba(123, 97, 255, 0.2)', color: '#c4b5fd', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>🏆 Зал ачивок</span>
                      </div>
                    </li>
                    <li>
                      <strong>Зажмите палец на пункте «Внести расход» и потяните его!</strong> Перетащите его в любое удобное место экрана.
                    </li>
                  </ol>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
                    🚀 Как это работает в повседневной жизни:
                  </div>
                  <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>
                    Вы купили кофе или оплатили покупку ➔ нажимаете 1 раз на вынесенную иконку «Внести расход» ➔ сразу открывается поле ввода суммы с открытой клавиатурой! Ввод занимает всего 2 секунды.
                  </p>
                </div>
              </div>
            )}

            {/* ANDROID METHOD 2: INSTALL PWA */}
            {androidTab === 'install' && (
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
                  Установка автономного приложения на Android
                </h4>
                <p style={{ fontSize: '12px', marginBottom: '14px' }}>
                  XPance превращается в полноценное Android-приложение без рамок и строк браузера:
                </p>

                {hasInstallPrompt && onInstallClick ? (
                  <button
                    onClick={onInstallClick}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #00e699 0%, #00b4d8 100%)',
                      color: '#051410',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '14px',
                      boxShadow: '0 0 20px rgba(0, 230, 153, 0.3)',
                    }}
                  >
                    <Download size={16} />
                    <span>📲 Установить XPance на этот Android в 1 клик</span>
                  </button>
                ) : (
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px', marginBottom: '6px' }}>
                      Инструкция для Chrome на Android:
                    </div>
                    <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Откройте сайт <strong>mishganchick.github.io/xpance/</strong> в Google Chrome.</li>
                      <li>Нажмите <strong>три точки</strong> в правом верхнем углу браузера.</li>
                      <li>Выберите <strong>«Установить приложение»</strong> (или «Добавить на главный экран»).</li>
                      <li>Нажмите «Установить». Иконка космического маскота появится среди ваших приложений!</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* ANDROID METHOD 3: KWGT LIVE WIDGET */}
            {androidTab === 'kwgt' && (
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#c4b5fd', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={16} />
                  <span>Интерактивный виджет через KWGT (Kustom Widget)</span>
                </h4>
                <p style={{ fontSize: '12px', marginBottom: '12px' }}>
                  <strong>KWGT</strong> — это самое популярное в мире приложение для создания любых кастомных виджетов на Android (более 10 млн скачиваний):
                </p>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      Установите бесплатный <a href="https://play.google.com/store/apps/details?id=org.kustom.widget" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>KWGT Kustom Widget в Google Play</a>.
                    </li>
                    <li>
                      На рабочем столе Android зажмите пустую область ➔ выберите <strong>«Виджеты»</strong> ➔ найдите <strong>KWGT</strong> ➔ выберите размер <strong>2x2</strong> или <strong>4x2</strong>.
                    </li>
                    <li>
                      Нажмите на созданный виджет ➔ добавьте фигуру (фон), текст («Дневной лимит: ${dailyFormatted}») и изображение маскота.
                    </li>
                    <li>
                      Во вкладке <strong>Touch (Действие при нажатии)</strong> выберите <strong>«Open Link»</strong> и вставьте ссылку прямого вызова расхода:
                    </li>
                  </ol>

                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={liveAppUrl}
                      style={{ fontSize: '11px', flex: 1, padding: '6px 10px', background: 'rgba(0,0,0,0.4)', color: '#00e699', border: '1px solid var(--border-subtle)' }}
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700, background: copiedUrl ? '#00e699' : 'var(--accent-cyan)', color: '#051410' }}
                    >
                      {copiedUrl ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= iOS SECTION ================= */}
        {platform === 'ios' && (
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '13px', marginBottom: '6px' }}>
                📱 Живой виджет на рабочий стол iPhone через Scriptable:
              </div>
              <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Установите бесплатный <a href="https://apps.apple.com/app/scriptable/id1405454705" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>Scriptable в App Store</a>.</li>
                <li>Нажмите кнопку ниже <strong>«Скопировать код виджета»</strong>.</li>
                <li>Откройте Scriptable, нажмите <strong>«+»</strong>, вставьте скопированный код и назовите скрипт <strong>XPance</strong>.</li>
                <li>На рабочем столе iPhone зажмите экран ➔ нажмите <strong>«+»</strong> ➔ выберите <strong>Scriptable</strong> ➔ укажите скрипт <strong>XPance</strong>. Готово!</li>
              </ol>
            </div>

            <button
              onClick={handleCopyCode}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                background: copiedCode ? '#00e699' : 'linear-gradient(135deg, #7b61ff 0%, #00b4d8 100%)',
                color: '#051410',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedCode ? '✅ Код скопирован в буфер!' : '📋 Скопировать код виджета для Scriptable'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
