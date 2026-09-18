import React, { useState } from 'react';
import { AppDataVault } from '../types/finance';
import { downloadBackupFile, uploadBackupFile, driveSync } from '../services/googleDriveSync';
import { Cloud, Download, Upload, Check, X, ShieldCheck, RefreshCw, Key, Trash2 } from 'lucide-react';
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
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={14} />
            <span>{t.sectionOAuth}</span>
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {t.oauthDesc}
          </p>
          <input
            type="text"
            placeholder={lang === 'ru' ? 'например: 123456789-abc.apps.googleusercontent.com' : 'e.g.: 123456789-abc.apps.googleusercontent.com'}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            style={{ width: '100%', fontSize: '12px', marginBottom: '12px' }}
          />
          <button
            onClick={() => {
              driveSync.setClientId(clientId);
              setStatusMessage(lang === 'ru' ? 'Client ID сохранён.' : 'Client ID saved.');
            }}
            className="cat-pill"
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            {t.saveClientIdBtn}
          </button>
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
