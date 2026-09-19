import React, { useState, useEffect } from 'react';
import { AppDataVault } from '../types/finance';
import { downloadBackupFile, uploadBackupFile, shareOrDownloadBackupFile, driveSync } from '../services/googleDriveSync';
import { Cloud, Download, Upload, Check, X, ShieldCheck, RefreshCw, Key, Trash2, ExternalLink, HelpCircle, Copy, QrCode, Smartphone, Send } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';
import QRCode from 'qrcode';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: AppDataVault;
  onVaultImported: (vault: AppDataVault) => void;
  onClearDatabase?: () => void;
  onLoadDemo?: () => void;
  onResetToDemo?: () => void;
  lang?: Language;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  vault,
  onVaultImported,
  onClearDatabase,
  onLoadDemo,
  onResetToDemo,
  lang = 'ru',
}) => {
  const t = getTranslation(lang);
  const [clientId, setClientId] = useState(vault.syncConfig.clientId || '');
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedPhoneUrl, setCopiedPhoneUrl] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const phoneNetworkUrl = 'http://192.168.1.21:5173/';

  useEffect(() => {
    if (isOpen) {
      // Generate QR code for phone access
      const urlToEncode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? phoneNetworkUrl
        : window.location.href;

      QRCode.toDataURL(urlToEncode, {
        width: 170,
        margin: 1,
        color: {
          dark: '#0a0d12',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyOrigin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  const handleCopyPhoneUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phoneNetworkUrl);
      setCopiedPhoneUrl(true);
      setTimeout(() => setCopiedPhoneUrl(false), 2000);
    }
  };

  const handleShareOrDownload = async () => {
    try {
      setIsProcessing(true);
      const shared = await shareOrDownloadBackupFile(vault);
      if (shared) {
        setStatusMessage(lang === 'ru'
          ? 'Файл бэкапа xpance_vault.json готов! Перешлите его себе в Telegram / AirDrop или сохраните в папку.'
          : 'Vault file xpance_vault.json ready! Send it via Telegram / AirDrop or save to files.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadBackup = async () => {
    try {
      setIsProcessing(true);
      const imported = await uploadBackupFile();
      onVaultImported(imported);
      setStatusMessage(lang === 'ru'
        ? '✅ Все данные успешно загружены и восстановлены!'
        : '✅ All data successfully restored from backup vault!');
    } catch (err: any) {
      setStatusMessage(lang === 'ru' ? `Ошибка загрузки: ${err.message}` : `Import error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00e699 0%, #00b4d8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cloud size={20} color="#051410" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{t.backupModalTitle}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lang === 'ru' ? 'Синхронизация между телефоном и ПК без API' : 'Sync between phone and PC without APIs'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Security & Privacy Banner */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 230, 153, 0.08)',
            border: '1px solid rgba(0, 230, 153, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <ShieldCheck size={18} color="#00e699" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {lang === 'ru' ? (
              <>
                <strong style={{ color: '#fff' }}>100% бесплатно и приватно:</strong> Данные хранятся на ваших устройствах. Никакие чужие серверы не имеют доступа к вашим счетам.
              </>
            ) : (
              <>
                <strong style={{ color: '#fff' }}>100% Free & Private:</strong> Stored locally on your devices. No external servers have access.
              </>
            )}
          </div>
        </div>

        {statusMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(0, 230, 153, 0.12)',
              border: '1px solid rgba(0, 230, 153, 0.3)',
              color: '#00e699',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* SECTION 1: Open on Phone via QR-code */}
        <div
          style={{
            marginBottom: '18px',
            padding: '14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.06) 0%, rgba(0, 230, 153, 0.04) 100%)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Smartphone size={16} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#fff', margin: 0, letterSpacing: '0.4px' }}>
              {lang === 'ru' ? '1. Открыть приложение на телефоне' : '1. Open on Phone via Wi-Fi'}
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {qrCodeDataUrl ? (
              <div
                style={{
                  background: '#fff',
                  padding: '6px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  flexShrink: 0,
                }}
              >
                <img src={qrCodeDataUrl} alt="Phone QR Code" style={{ width: '130px', height: '130px', display: 'block' }} />
              </div>
            ) : (
              <div style={{ width: '130px', height: '130px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} />
            )}

            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                {lang === 'ru' ? (
                  <>
                    Наведите <strong>камеру смартфона</strong> на QR-код (когда телефон подключен к тому же домашнему Wi-Fi), чтобы мгновенно открыть XPance.
                  </>
                ) : (
                  <>
                    Point your <strong>smartphone camera</strong> at the QR code (while on same Wi-Fi) to open XPance immediately.
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <code style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#00e699', fontWeight: 700 }}>
                  {phoneNetworkUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPhoneUrl}
                  className="cat-pill"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: copiedPhoneUrl ? '#00e699' : 'var(--text-secondary)',
                  }}
                >
                  {copiedPhoneUrl ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedPhoneUrl ? (lang === 'ru' ? 'Скопировано' : 'Copied') : (lang === 'ru' ? 'Копировать' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Transfer Data (100% Free, No APIs) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Send size={15} color="var(--accent-joy)" />
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
              {lang === 'ru' ? '2. Перенос данных между устройствами (Без API)' : '2. Transfer Data Between Devices (No APIs)'}
            </h4>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
            {lang === 'ru'
              ? 'Самый надежный и бесплатный способ перенести все счета, историю и лимиты с компьютера на телефон или сделать бэкап:'
              : 'The simplest 100% free way to move all your accounts, budget, and history to your phone or backup:'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <button
              onClick={handleShareOrDownload}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                background: 'rgba(255, 183, 3, 0.12)',
                border: '1px solid rgba(255, 183, 3, 0.35)',
                color: '#ffb703',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Download size={16} />
              <span>{lang === 'ru' ? 'Скачать / Переслать бэкап' : 'Share / Download Vault'}</span>
            </button>

            <button
              onClick={handleUploadBackup}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                background: 'rgba(0, 230, 153, 0.12)',
                border: '1px solid rgba(0, 230, 153, 0.35)',
                color: '#00e699',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Upload size={16} />
              <span>{lang === 'ru' ? 'Загрузить файл на этом устройстве' : 'Import Vault File'}</span>
            </button>
          </div>

          {/* Step by Step visual tutorial */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              {lang === 'ru' ? 'Как перенести данные на телефон за 2 шага:' : 'How to move data to your phone in 2 steps:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <strong>1.</strong> {lang === 'ru'
                  ? 'Нажмите «Скачать / Переслать бэкап» и отправьте файл xpance_vault.json себе в Telegram («Избранное»), AirDrop или почту.'
                  : 'Click «Share / Download Vault» and send xpance_vault.json to your Telegram (Saved Messages) or AirDrop.'}
              </div>
              <div>
                <strong>2.</strong> {lang === 'ru'
                  ? 'На телефоне откройте XPance, нажмите это облачко ➔ «Загрузить файл» ➔ выберите скачанный xpance_vault.json. Все счета и история сразу на месте!'
                  : 'On your phone open XPance, tap this cloud icon ➔ «Import Vault File» ➔ select xpance_vault.json. You are all set!'}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Optional Google Cloud OAuth (Collapsed for Developers) */}
        <details
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
            marginBottom: '16px',
          }}
        >
          <summary
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚙️ {lang === 'ru' ? 'Для разработчиков: Настройка Google Cloud OAuth API (необязательно)' : 'Developer: Google Cloud OAuth API Setup (Optional)'}</span>
          </summary>

          <div style={{ marginTop: '12px', paddingLeft: '8px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.4' }}>
              {t.oauthDesc}
            </p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder={lang === 'ru' ? 'например: 123456789-abc.apps.googleusercontent.com' : 'e.g.: 123456789-abc.apps.googleusercontent.com'}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ flex: 1, fontSize: '11px', padding: '8px' }}
              />
              <button
                onClick={() => {
                  driveSync.setClientId(clientId);
                  setStatusMessage(lang === 'ru' ? 'Client ID успешно сохранён.' : 'Client ID saved successfully.');
                }}
                className="cat-pill"
                style={{ fontSize: '11px', padding: '8px 14px', whiteSpace: 'nowrap' }}
              >
                {t.saveClientIdBtn}
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}
              >
                {t.openGoogleConsoleBtn} ↗
              </a>
              {' '}| Authorized origin: <code>{currentOrigin}</code>
            </div>
          </div>
        </details>

        {/* SECTION 4: Database Management */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-ruby)' }}>{t.clearDbTitle}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.clearDbDesc}</div>
            </div>
            <button
              onClick={() => {
                if (confirm(t.clearDbConfirm)) {
                  if (onClearDatabase) onClearDatabase();
                  else if (onResetToDemo) onResetToDemo();
                  setStatusMessage(lang === 'ru' ? 'База данных успешно очищена!' : 'Database cleared successfully!');
                }
              }}
              className="cat-pill"
              style={{
                fontSize: '11px',
                color: 'var(--accent-ruby)',
                borderColor: 'rgba(255, 59, 92, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
              }}
            >
              <Trash2 size={12} />
              <span>{t.clearAllBtn}</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.demoDataTitle}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.demoDataDesc}</div>
            </div>
            <button
              onClick={() => {
                if (confirm(t.loadDemoConfirm)) {
                  if (onLoadDemo) onLoadDemo();
                  else if (onResetToDemo) onResetToDemo();
                  setStatusMessage(lang === 'ru' ? 'Демо-данные загружены!' : 'Demo data loaded successfully!');
                }
              }}
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} />
              <span>{t.loadDemoBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
