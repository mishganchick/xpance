import React, { useState, useEffect } from 'react';
import { AppDataVault } from '../types/finance';
import { downloadBackupFile, uploadBackupFile, shareOrDownloadBackupFile, driveSync } from '../services/googleDriveSync';
import { Cloud, Download, Upload, Check, X, ShieldCheck, RefreshCw, Key, Trash2, ExternalLink, HelpCircle, Copy, Smartphone, Send, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
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

const DEFAULT_CLIENT_ID = '916734423312-5j7ps0jcc7mpr29h8t5e0ml7dl56nmpl.apps.googleusercontent.com';

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
  const [clientId, setClientId] = useState(vault.syncConfig?.clientId || DEFAULT_CLIENT_ID);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedPhoneUrl, setCopiedPhoneUrl] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Google OAuth Auth State
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(driveSync.isAuthorized());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [driveFileDetails, setDriveFileDetails] = useState<{ id: string; name: string; modifiedTime: string } | null>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const publicLiveUrl = 'https://mishganchick.github.io/xpance/';
  const localNetworkUrl = 'http://192.168.1.21:5173/';

  useEffect(() => {
    if (isOpen) {
      // Set client id in service
      const activeId = vault.syncConfig?.clientId || DEFAULT_CLIENT_ID;
      setClientId(activeId);
      driveSync.setClientId(activeId);

      // Generate QR code for phone access
      QRCode.toDataURL(publicLiveUrl, {
        width: 170,
        margin: 1,
        color: {
          dark: '#0a0d12',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));

      // If already authorized, fetch status
      if (driveSync.isAuthorized()) {
        setIsGoogleAuthorized(true);
        driveSync.getUserEmail().then((email) => setUserEmail(email));
        driveSync.findVaultFileDetails().then((details) => setDriveFileDetails(details));
      }
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
      navigator.clipboard.writeText(publicLiveUrl);
      setCopiedPhoneUrl(true);
      setTimeout(() => setCopiedPhoneUrl(false), 2000);
    }
  };

  // Google OAuth Sign In & Check Drive
  const handleGoogleSignIn = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage('');
      setStatusMessage('');

      const cleanId = clientId.trim();
      if (!cleanId) {
        setErrorMessage(lang === 'ru' ? 'Введите Google Client ID' : 'Please enter Google Client ID');
        return;
      }

      driveSync.setClientId(cleanId);
      // Persist client ID to vault
      const updatedVault = {
        ...vault,
        syncConfig: {
          ...vault.syncConfig,
          clientId: cleanId,
        },
      };
      onVaultImported(updatedVault);

      // Request Token (Opens Google login popup)
      await driveSync.requestToken();
      setIsGoogleAuthorized(true);

      const email = await driveSync.getUserEmail();
      setUserEmail(email);

      // Check Drive file
      const details = await driveSync.findVaultFileDetails();
      setDriveFileDetails(details);

      if (details) {
        const modDate = new Date(details.modifiedTime).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
        setStatusMessage(lang === 'ru'
          ? `✅ Успешный вход (${email || 'Google'}). На Диске найден бэкап от ${modDate}. Вы можете скачать его или обновить.`
          : `✅ Signed in (${email || 'Google'}). Backup from ${modDate} found on Drive.`);
      } else {
        // Auto upload first copy
        await driveSync.uploadVault(vault);
        const newDetails = await driveSync.findVaultFileDetails();
        setDriveFileDetails(newDetails);
        setStatusMessage(lang === 'ru'
          ? `✅ Успешный вход (${email || 'Google'})! Текущие данные сохранены в Google Диск.`
          : `✅ Signed in (${email || 'Google'})! Current data saved to your Google Drive.`);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const msg = err.message || String(err);
      if (msg.includes('origin') || msg.includes('redirect_uri_mismatch')) {
        setErrorMessage(lang === 'ru'
          ? `Ошибка доступа Google: адрес «${currentOrigin}» не добавлен в «Authorized JavaScript origins» в Google Cloud Console для этого Client ID.`
          : `Origin error: «${currentOrigin}» is not in Authorized JavaScript origins in Google Cloud Console.`);
      } else {
        setErrorMessage(lang === 'ru' ? `Ошибка входа: ${msg}` : `Sign in error: ${msg}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload to Google Drive
  const handleUploadToDrive = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage('');
      await driveSync.uploadVault(vault);
      const details = await driveSync.findVaultFileDetails();
      setDriveFileDetails(details);
      setStatusMessage(lang === 'ru'
        ? '✅ Данные с этого устройства успешно выгружены на Google Диск!'
        : '✅ Data from this device successfully uploaded to Google Drive!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка загрузки на Google Диск');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download from Google Drive
  const handleDownloadFromDrive = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage('');
      const downloaded = await driveSync.downloadVault();
      if (!downloaded || !downloaded.accounts) {
        throw new Error(lang === 'ru' ? 'Файл на Google Диске пуст или поврежден' : 'File on Google Drive is empty or invalid');
      }
      onVaultImported(downloaded);
      setStatusMessage(lang === 'ru'
        ? '🎉 Данные успешно скачаны с Google Диска и синхронизированы на этом устройстве!'
        : '🎉 Data successfully downloaded from Google Drive and synced!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка скачивания с Google Диска');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnectGoogle = () => {
    driveSync.disconnect();
    setIsGoogleAuthorized(false);
    setUserEmail(null);
    setDriveFileDetails(null);
    setStatusMessage(lang === 'ru' ? 'Вы вышли из аккаунта Google.' : 'Signed out from Google.');
  };

  // Offline / Telegram Share
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
      setErrorMessage(lang === 'ru' ? `Ошибка загрузки: ${err.message}` : `Import error: ${err.message}`);
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
                {lang === 'ru' ? 'Синхронизация между телефоном и ПК через Google Диск' : 'Sync between phone and PC via Google Drive'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Status Messages */}
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
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 59, 92, 0.15)',
              border: '1px solid rgba(255, 59, 92, 0.35)',
              color: '#ff3b5c',
              fontSize: '12px',
              lineHeight: '1.4',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* SECTION 1: GOOGLE DRIVE DIRECT SYNC */}
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 230, 153, 0.07) 0%, rgba(0, 180, 216, 0.05) 100%)',
            border: '1px solid rgba(0, 230, 153, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={15} color="#00e699" />
              <span>1. Google Drive Авто-Синхронизация</span>
            </h4>
            {isGoogleAuthorized && (
              <span style={{ fontSize: '11px', color: '#00e699', fontWeight: 700, background: 'rgba(0, 230, 153, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                🟢 Подключено
              </span>
            )}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
            {lang === 'ru'
              ? 'Сохраняет ваш файл xpance_vault.json прямо в личный Google Диск и позволяет в 1 клик переносить изменения между ПК и телефоном:'
              : 'Syncs xpance_vault.json directly to your Google Drive to seamlessly keep PC and phone in sync:'}
          </p>

          {!isGoogleAuthorized ? (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Google OAuth Client ID:
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="xxxx.apps.googleusercontent.com"
                  style={{ width: '100%', fontSize: '11px', padding: '8px 10px' }}
                />
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #00e699 0%, #00b4d8 100%)',
                  color: '#051410',
                  boxShadow: '0 4px 15px rgba(0, 230, 153, 0.25)',
                  marginBottom: '10px',
                }}
              >
                <Key size={16} />
                <span>{isProcessing ? (lang === 'ru' ? 'Подключение...' : 'Connecting...') : (lang === 'ru' ? 'Войти через Google и Синхронизировать' : 'Sign in with Google & Sync')}</span>
              </button>

              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ⚠️ <strong>Важно:</strong> В настройках этого Client ID в <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>Google Cloud Console</a> в поле <em>«Authorized JavaScript origins»</em> добавьте:
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <code style={{ color: '#00e699', background: 'rgba(255,255,255,0.06)', padding: '2px 4px', borderRadius: '4px' }}>https://mishganchick.github.io</code>
                  <code style={{ color: '#00e699', background: 'rgba(255,255,255,0.06)', padding: '2px 4px', borderRadius: '4px' }}>http://localhost:5173</code>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                  👤 {userEmail || 'Google Drive'}
                </div>
                <button
                  onClick={handleDisconnectGoogle}
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={12} />
                  <span>Выйти</span>
                </button>
              </div>

              {driveFileDetails && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  📁 Файл на Google Диске: <strong>{driveFileDetails.name}</strong> (обновлен: {new Date(driveFileDetails.modifiedTime).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')})
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={handleDownloadFromDrive}
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{
                    background: 'rgba(0, 230, 153, 0.15)',
                    border: '1px solid rgba(0, 230, 153, 0.4)',
                    color: '#00e699',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <Download size={14} />
                  <span>{lang === 'ru' ? '⬇️ Скачать с Google Диска' : '⬇️ Download from Drive'}</span>
                </button>

                <button
                  onClick={handleUploadToDrive}
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{
                    background: 'rgba(255, 183, 3, 0.15)',
                    border: '1px solid rgba(255, 183, 3, 0.4)',
                    color: '#ffb703',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <Upload size={14} />
                  <span>{lang === 'ru' ? '⬆️ Загрузить на Google Диск' : '⬆️ Upload to Drive'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Instant Transfer via Telegram / File */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Send size={15} color="var(--accent-joy)" />
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
              {lang === 'ru' ? '2. Ручной перенос файла (Без интернета / Telegram)' : '2. File Backup & Share'}
            </h4>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
            {lang === 'ru'
              ? 'Если не хочется подключать аккаунт Google — можно переслать файл xpance_vault.json себе в Telegram или через AirDrop:'
              : 'Direct 1-click export and import of your vault file:'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <button
              onClick={handleShareOrDownload}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Download size={15} color="var(--accent-joy)" />
              <span>{lang === 'ru' ? 'Скачать / Переслать файл' : 'Share / Export Vault'}</span>
            </button>

            <button
              onClick={handleUploadBackup}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Upload size={15} color="var(--accent-emerald)" />
              <span>{lang === 'ru' ? 'Загрузить файл на этом ПК' : 'Import Vault File'}</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: QR-Code for Mobile Web */}
        <div
          style={{
            marginBottom: '18px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Smartphone size={15} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
              3. Открыть приложение на телефоне
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            {qrCodeDataUrl && (
              <div
                style={{
                  background: '#fff',
                  padding: '5px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img src={qrCodeDataUrl} alt="Phone QR Code" style={{ width: '100px', height: '100px', display: 'block' }} />
              </div>
            )}

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Официальная веб-версия XPance (откройте на телефоне):
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <a
                  href={publicLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#00e699',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{publicLiveUrl}</span>
                  <ExternalLink size={10} />
                </a>
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
                  <span>{copiedPhoneUrl ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Database Management */}
        <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-ruby)' }}>{t.clearDbTitle}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.clearDbDesc}</div>
            </div>
            <button
              onClick={() => {
                if (confirm(t.clearDbConfirm)) {
                  if (onClearDatabase) onClearDatabase();
                  else if (onResetToDemo) onResetToDemo();
                  setStatusMessage('База данных успешно очищена!');
                }
              }}
              className="cat-pill"
              style={{
                fontSize: '10px',
                color: 'var(--accent-ruby)',
                borderColor: 'rgba(255, 59, 92, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
              }}
            >
              <Trash2 size={11} />
              <span>{t.clearAllBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
