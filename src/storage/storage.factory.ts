import { FactoryProvider } from '@nestjs/common';
import { IStorageService } from './storage.service.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
export const STORAGE_TYPE = 'STORAGE_TYPE';
export type StorageType = 'local' | 'minio' | 's3';

export const storageProvider: FactoryProvider = {
  provide: STORAGE_SERVICE,
  useFactory: (): IStorageService => {
    const storageType = (process.env.STORAGE_TYPE || 'local') as StorageType;

    switch (storageType) {
      case 'minio':
      case 's3':
        return new S3StorageService();
      case 'local':
      default:
        return new LocalStorageService();
    }
  },
};
