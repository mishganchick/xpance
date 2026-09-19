import { AppDataVault } from '../types/finance';

export const DRIVE_FILE_NAME = 'xpance_vault.json';
export const LEGACY_DRIVE_FILE_NAME = 'nexus_finance_vault.json';

export interface DriveSyncStatus {
  isConfigured: boolean;
  isSignedIn: boolean;
  userEmail?: string;
  isSyncing: boolean;
  lastSynced?: string;
  error?: string;
}

/**
 * Скачивание файла бэкапа на устройство (можно сохранить прямо в локальную папку Google Drive)
 */
export function downloadBackupFile(vault: AppDataVault): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vault, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', DRIVE_FILE_NAME);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Отправка через системное меню «Поделиться» (Telegram, AirDrop, Файлы) или скачивание файла
 */
export async function shareOrDownloadBackupFile(vault: AppDataVault): Promise<boolean> {
  const json = JSON.stringify(vault, null, 2);
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([json], DRIVE_FILE_NAME, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'XPance Vault',
          text: 'Резервная копия данных XPance (счета, операции, бюджет)',
          files: [file],
        });
        return true;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
    }
  }

  downloadBackupFile(vault);
  return true;
}

/**
 * Загрузка файла бэкапа из Google Drive / файловой системы
 */
export function uploadBackupFile(): Promise<AppDataVault> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        reject(new Error('Файл не выбран'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content) as AppDataVault;
          resolve(parsed);
        } catch (err) {
          reject(new Error('Не удалось прочитать JSON файл'));
        }
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file);
    };
    input.click();
  });
}

/**
 * Google Drive REST API V3 Helper
 */
export class GoogleDriveSyncService {
  private clientId: string = '';
  private token: string | null = null;
  private tokenClient: any = null;

  constructor(clientId?: string) {
    if (clientId) {
      this.clientId = clientId;
    }
  }

  public setClientId(clientId: string) {
    this.clientId = clientId;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public async initGis(): Promise<void> {
    if (typeof window === 'undefined') return;
    // Check if google script is loaded
    const gWindow = window as any;
    if (gWindow.google?.accounts?.oauth2 && this.clientId) {
      this.tokenClient = gWindow.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (resp: any) => {
          if (resp.access_token) {
            this.token = resp.access_token;
          }
        },
      });
    }
  }

  public requestToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google Client ID не настроен'));
        return;
      }
      this.tokenClient.callback = (resp: any) => {
        if (resp.error) {
          reject(new Error(resp.error));
          return;
        }
        this.token = resp.access_token;
        resolve(resp.access_token);
      };
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  /**
   * Найти существующий файл xpance_vault.json (или nexus_finance_vault.json) на Google Диске
   */
  public async findVaultFile(): Promise<string | null> {
    if (!this.token) throw new Error('Не авторизован в Google');
    const q = encodeURIComponent(`(name = '${DRIVE_FILE_NAME}' or name = '${LEGACY_DRIVE_FILE_NAME}') and trashed = false`);
    const resp = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await resp.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  }

  /**
   * Загрузить vault на Google Диск
   */
  public async uploadVault(vault: AppDataVault): Promise<void> {
    if (!this.token) throw new Error('Не авторизован в Google');
    const existingFileId = await this.findVaultFile();

    const fileContent = JSON.stringify(vault, null, 2);
    const metadata = {
      name: DRIVE_FILE_NAME,
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const resp = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${this.token}` },
      body: form,
    });

    if (!resp.ok) {
      throw new Error(`Ошибка загрузки на Google Drive: ${resp.statusText}`);
    }
  }

  /**
   * Скачать vault с Google Диска
   */
  public async downloadVault(): Promise<AppDataVault | null> {
    if (!this.token) throw new Error('Не авторизован в Google');
    const fileId = await this.findVaultFile();
    if (!fileId) return null;

    const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!resp.ok) {
      throw new Error(`Ошибка чтения файла с Google Drive: ${resp.statusText}`);
    }

    return await resp.json();
  }
}

export const driveSync = new GoogleDriveSyncService();
