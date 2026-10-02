import type { IStorageAdapter } from '../types';

export class MockStorageAdapter implements IStorageAdapter {
  async getUploadUrl(invoiceId: string, fileName: string, _fileType: string) {
    await new Promise(r => setTimeout(r, 500));
    return {
      uploadUrl: `mock://s3.local/private-documents/${invoiceId}/${fileName}?X-Amz-Expires=300`,
      fileKey: `documents/${invoiceId}/${fileName}`,
    };
  }

  async getDownloadUrl(fileKey: string) {
    await new Promise(r => setTimeout(r, 200));
    return `mock://s3.local/${fileKey}?X-Amz-Expires=300`;
  }

  async deleteFile(_fileKey: string) {
    await new Promise(r => setTimeout(r, 200));
  }
}
