/**
 * Storage Service
 * Handles S3 operations with cleanup and error handling
 */

import { getUploadUrl, getDownloadUrl, deleteObject, uploadBuffer } from '@/lib/s3';

export class StorageService {
  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    return getUploadUrl(key, contentType);
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    return getDownloadUrl(key);
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<void> {
    return uploadBuffer(key, buffer, contentType);
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await deleteObject(key);
      console.log(`[Storage] Deleted: ${key}`);
    } catch (error) {
      console.error(`[Storage] Failed to delete ${key}:`, error);
      // Don't throw - log and continue to allow cascade deletes to proceed
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    const results = await Promise.allSettled(
      keys.map(key => this.deleteFile(key))
    );

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`[Storage] Failed to delete ${failed.length} of ${keys.length} files`);
    }
  }
}

export const storageService = new StorageService();