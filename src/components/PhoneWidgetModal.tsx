import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, ExternalLink, Sparkles, Zap, Target, Trophy, ArrowRight, Share2, PlusSquare } from 'lucide-react';
import { Language } from '../services/i18n';
import { PeriodBudget } from '../types/finance';
import { calculateBudgetMetrics } from '../services/budgetService';
import { formatMoney } from '../services/currencyService';

interface PhoneWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: PeriodBudget;
  transactions?: any[];
  lang?: Language;
}

export const PhoneWidgetModal: React.FC<PhoneWidgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  transactions = [],
  lang = 'ru',
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'scriptable' | 'shortcuts'>('pwa');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const metrics = budget ? calculateBudgetMetrics(budget, transactions) : null;
  const dailyFormatted = metrics ? formatMoney(metrics.dailyAllowanceToday, budget?.currency || 'RUB') : '2 500 ₽';
  const remainingFormatted = metrics ? formatMoney(metrics.remainingBudget, budget?.currency || 'RUB') : '45 000 ₽';
  const daysLeft = metrics ? metrics.daysRemaining : 18;

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7b61ff 0%, #00b4d8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(123, 97, 255, 0.4)',
              }}
            >
              <Smartphone size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
                {lang === 'ru' ? 'Виджет на телефон' : 'Phone Widget'}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lang === 'ru' ? 'Быстрый доступ и виджет на рабочем столе iPhone / Android' : 'Homescreen widget & quick actions for iOS / Android'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Realistic Widget Mockup Preview */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.08) 0%, rgba(0, 230, 153, 0.05) 100%)',
            border: '1px solid rgba(123, 97, 255, 0.3)',
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px' }}>
            {lang === 'ru' ? 'Как выглядит виджет на экране телефона:' : 'Homescreen Widget Preview:'}
          </div>

          {/* Small iOS Widget Mockup */}
          <div
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, #131a26 0%, #080b10 100%)',
              border: '1.5px solid rgba(123, 97, 255, 0.35)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(123, 97, 255, 0.25)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Widget Top Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '7px',
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
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', margin: '2px 0' }}>
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
              <span>{lang === 'ru' ? '➕ Внести расход' : '➕ Add Expense'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            marginBottom: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '4px',
            borderRadius: '10px',
          }}
        >
          <button
            onClick={() => setActiveTab('pwa')}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'pwa' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'pwa' ? '#051410' : 'var(--text-secondary)',
            }}
          >
            {lang === 'ru' ? '1. Иконка + Меню' : '1. App Shortcuts'}
          </button>
          <button
            onClick={() => setActiveTab('scriptable')}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'scriptable' ? '#7b61ff' : 'transparent',
              color: activeTab === 'scriptable' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {lang === 'ru' ? '2. Виджет iOS' : '2. iOS Widget'}
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'shortcuts' ? 'var(--accent-joy)' : 'transparent',
              color: activeTab === 'shortcuts' ? '#150f02' : 'var(--text-secondary)',
            }}
          >
            {lang === 'ru' ? '3. Команды iOS' : '3. Shortcuts'}
          </button>
        </div>

        {/* TAB 1: PWA SHORTCUTS */}
        {activeTab === 'pwa' && (
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusSquare size={16} color="var(--accent-cyan)" />
              <span>{lang === 'ru' ? 'Добавление на экран Домой и Быстрые Действия' : 'Add to Homescreen & Quick Actions'}</span>
            </h4>
            <p style={{ fontSize: '12px', marginBottom: '12px' }}>
              {lang === 'ru'
                ? 'Веб-приложение XPance поддерживает нативный режим PWA. После добавления на рабочий стол оно работает без адресной строки браузера как обычное приложение.'
                : 'XPance operates as a standalone PWA without browser URL bars once saved to your homescreen.'}
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px', marginBottom: '6px' }}>
                {lang === 'ru' ? '📱 Инструкция для iPhone (Safari):' : '📱 For iPhone (Safari):'}
              </div>
              <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Откройте сайт <strong>mishganchick.github.io/xpance/</strong> в браузере Safari.</li>
                <li>Нажмите системную кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх по центру внизу).</li>
                <li>Прокрутите вниз и выберите <strong>«На экран "Домой"»</strong> (Add to Home Screen).</li>
                <li>Нажмите <strong>«Добавить»</strong>. На рабочем столе появится космический маскот XPance!</li>
              </ol>
            </div>

            <div style={{ background: 'rgba(0, 230, 153, 0.08)', border: '1px solid rgba(0, 230, 153, 0.3)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontWeight: 800, color: '#00e699', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} />
                <span>{lang === 'ru' ? 'Секретная фишка: Меню быстрого расхода (Haptic Touch)' : 'Haptic Touch Quick Actions'}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#e2e8f0', margin: 0 }}>
                {lang === 'ru'
                  ? 'Зажмите палец на иконке XPance на рабочем столе телефона — появится быстрое меню: «Внести расход», «Дневной бюджет» и «Зал ачивок». Одно нажатие — и вы сразу вводите сумму!'
                  : 'Long press the XPance icon on your homescreen to instantly trigger "Add Expense", "Daily Budget", or "Achievements".'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: SCRIPTABLE LIVE WIDGET */}
        {activeTab === 'scriptable' && (
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#7b61ff" />
              <span>{lang === 'ru' ? 'Настоящий интерактивный виджет через Scriptable (iOS)' : 'Real iOS Homescreen Widget via Scriptable'}</span>
            </h4>
            <p style={{ fontSize: '12px', marginBottom: '12px' }}>
              {lang === 'ru'
                ? 'В iOS приложения из браузера не могут напрямую размещать виджеты на рабочем столе. Но с помощью популярного бесплатного приложения Scriptable (из App Store) вы можете создать живой виджет с маскотом за 1 минуту:'
                : 'Using the free Scriptable app from the App Store, you can place a live XPance widget on your iOS homescreen in 1 minute:'}
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
              <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  Установите бесплатное приложение <a href="https://apps.apple.com/app/scriptable/id1405454705" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>Scriptable в App Store</a>.
                </li>
                <li>
                  Нажмите кнопку ниже <strong>«Скопировать код виджета»</strong>.
                </li>
                <li>
                  Откройте Scriptable, нажмите <strong>«+»</strong> в правом верхнем углу, вставьте скопированный код и назовите скрипт <strong>XPance</strong>.
                </li>
                <li>
                  Вернитесь на рабочий стол iPhone, зажмите пустую область ➔ нажмите <strong>«+»</strong> ➔ выберите виджет <strong>Scriptable</strong> ➔ выберите скрипт <strong>XPance</strong>. Готово!
                </li>
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
              <span>{copiedCode ? (lang === 'ru' ? '✅ Код скопирован в буфер!' : '✅ Copied to clipboard!') : (lang === 'ru' ? '📋 Скопировать код виджета для Scriptable' : '📋 Copy Scriptable Widget Code')}</span>
            </button>
          </div>
        )}

        {/* TAB 3: APPLE SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="var(--accent-joy)" />
              <span>{lang === 'ru' ? 'Виджет быстрых команд Apple (Shortcuts)' : 'Apple Shortcuts Widget'}</span>
            </h4>
            <p style={{ fontSize: '12px', marginBottom: '12px' }}>
              {lang === 'ru'
                ? 'Вы можете добавить кнопку «Записать расход XPance» на Экран блокировки (Lock Screen) или на кнопку Action Button (на iPhone 15/16 Pro):'
                : 'Place an "Add Expense" button right on your iOS Lock Screen or Action Button:'}
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
              <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Откройте встроенное приложение <strong>«Команды» (Shortcuts)</strong> на iPhone.</li>
                <li>Нажмите <strong>«+»</strong> (Новая команда) ➔ добавьте действие <strong>«Открыть URL»</strong>.</li>
                <li>
                  В поле URL вставьте:
                  <div style={{ margin: '4px 0' }}>
                    <code style={{ color: '#00e699', background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', wordBreak: 'break-all' }}>
                      https://mishganchick.github.io/xpance/?action=add_expense
                    </code>
                  </div>
                </li>
                <li>Назовите команду <strong>«Расход XPance»</strong> и выберите иконку.</li>
                <li>Теперь добавьте эту команду в виде виджета на экран блокировки или рабочий стол!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
