import type { IStorageAdapter } from '../types';

export class AwsStorageAdapter implements IStorageAdapter {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getUploadUrl(invoiceId: string, fileName: string, fileType: string) {
    const res = await fetch(`${this.apiBaseUrl}/invoices/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, fileName, fileType }),
    });
    if (!res.ok) throw new Error('Failed to get upload URL');
    return res.json();
  }

  async getDownloadUrl(fileKey: string) {
    const res = await fetch(`${this.apiBaseUrl}/documents/download-url?key=${encodeURIComponent(fileKey)}`);
    if (!res.ok) throw new Error('Failed to get download URL');
    const data = await res.json();
    return data.downloadUrl;
  }

  async deleteFile(fileKey: string) {
    const res = await fetch(`${this.apiBaseUrl}/documents?key=${encodeURIComponent(fileKey)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete file');
  }
}
