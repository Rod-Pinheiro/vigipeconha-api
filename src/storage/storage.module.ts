import { Module, Global } from '@nestjs/common';
import { storageProvider, STORAGE_SERVICE } from './storage.factory';

@Global()
@Module({
  providers: [storageProvider],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
