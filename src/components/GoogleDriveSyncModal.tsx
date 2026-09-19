import React, { useState } from 'react';
import { AppDataVault } from '../types/finance';
import { downloadBackupFile, uploadBackupFile, driveSync } from '../services/googleDriveSync';
import { Cloud, Download, Upload, Check, X, ShieldCheck, RefreshCw, Key, Trash2, ExternalLink, HelpCircle, Copy } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

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

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const handleCopyOrigin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    downloadBackupFile(vault);
    setStatusMessage(lang === 'ru'
      ? 'Файл бэкапа xpance_vault.json успешно скачан! Сохраните его в свой Google Диск.'
      : 'Vault backup file xpance_vault.json downloaded successfully! Store it in your Google Drive.');
  };

  const handleUploadBackup = async () => {
    try {
      setIsProcessing(true);
      const imported = await uploadBackupFile();
      onVaultImported(imported);
      setStatusMessage(lang === 'ru'
        ? 'Данные успешно восстановлены из файла бэкапа!'
        : 'Data restored successfully from backup vault!');
    } catch (err: any) {
      setStatusMessage(lang === 'ru' ? `Ошибка загрузки: ${err.message}` : `Import error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
                {lang === 'ru' ? 'Приватный Local-First учет без сторонних баз данных' : 'Private Local-First finances without 3rd-party databases'}
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
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(0, 230, 153, 0.08)',
            border: '1px solid rgba(0, 230, 153, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <ShieldCheck size={20} color="#00e699" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            {lang === 'ru' ? (
              <>
                Ваши финансовые данные хранятся <strong style={{ color: '#fff' }}>только на ваших устройствах</strong> в формате файла <code>xpance_vault.json</code>. Никакие третьи лица и сервера не имеют доступа к вашим счетам.
              </>
            ) : (
              <>
                Your financial data is stored <strong style={{ color: '#fff' }}>strictly on your own devices</strong> in <code>xpance_vault.json</code>. No third-party servers ever touch your finances.
              </>
            )}
          </div>
        </div>

        {statusMessage && (
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255, 183, 3, 0.12)',
              border: '1px solid rgba(255, 183, 3, 0.3)',
              color: '#ffb703',
              fontSize: '12px',
              marginBottom: '18px',
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* SECTION 1: One-click local backup */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {t.sectionBackupFile}
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {t.backupFileDesc}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={handleDownloadBackup}
              className="btn-primary"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '12px',
                fontSize: '13px',
              }}
            >
              <Download size={16} color="var(--accent-emerald)" />
              <span>{t.downloadBackupBtn}</span>
            </button>

            <button
              onClick={handleUploadBackup}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '12px',
                fontSize: '13px',
              }}
            >
              <Upload size={16} color="var(--accent-joy)" />
              <span>{isProcessing ? (lang === 'ru' ? 'Загрузка...' : 'Loading...') : t.restoreBackupBtn}</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Direct Google Drive API OAuth */}
        <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Key size={14} />
              <span>{t.sectionOAuth}</span>
            </h4>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="cat-pill"
              style={{
                fontSize: '11px',
                color: 'var(--accent-cyan)',
                borderColor: 'rgba(0, 217, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <ExternalLink size={12} />
              <span>{t.openGoogleConsoleBtn}</span>
            </a>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
            {t.oauthDesc}
          </p>

          {/* Quick Step-by-Step Helper Card with direct links */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px',
              fontSize: '11px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--accent-joy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={13} />
              <span>{t.oauthHelpTitle}</span>
            </div>
            <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                {t.oauthStep1}{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  {t.oauthLinkConsole} ↗
                </a>
              </li>
              <li>
                {t.oauthStep2}
              </li>
              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <span>{t.oauthStep3}</span>
                  <code style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '2px 6px', borderRadius: '4px', color: '#00e699', fontWeight: 700 }}>
                    {currentOrigin}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyOrigin}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      color: copiedOrigin ? '#00e699' : 'var(--text-muted)',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    {copiedOrigin ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedOrigin ? (lang === 'ru' ? 'Скопировано' : 'Copied') : (lang === 'ru' ? 'Скопировать' : 'Copy')}</span>
                  </button>
                </div>
              </li>
              <li>
                {t.oauthStep4}
              </li>
              <li>
                {t.oauthStep5}{' '}
                <a
                  href="https://console.cloud.google.com/apis/library/drive.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  {t.oauthLinkDriveApi} ↗
                </a>
              </li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={lang === 'ru' ? 'например: 123456789-abc.apps.googleusercontent.com' : 'e.g.: 123456789-abc.apps.googleusercontent.com'}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              style={{ flex: 1, fontSize: '12px' }}
            />
            <button
              onClick={() => {
                driveSync.setClientId(clientId);
                setStatusMessage(lang === 'ru' ? 'Client ID успешно сохранён.' : 'Client ID saved successfully.');
              }}
              className="cat-pill"
              style={{ fontSize: '12px', padding: '10px 16px', whiteSpace: 'nowrap' }}
            >
              {t.saveClientIdBtn}
            </button>
          </div>
        </div>

        {/* SECTION 3: Database Management */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
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
