import { Injectable } from '@nestjs/common';
import { IStorageService, MulterFile } from './storage.service.interface';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadPath: string;

  constructor() {
    this.uploadPath = process.env.LOCAL_UPLOAD_PATH || './uploads';
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async upload(file: MulterFile): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    await fs.promises.writeFile(filepath, file.buffer);
    return `${process.env.API_URL || 'http://localhost:3001'}/uploads/${filename}`;
  }

  async uploadMultiple(files: MulterFile[]): Promise<string[]> {
    const urls = await Promise.all(files.map((file) => this.upload(file)));
    return urls;
  }

  async delete(url: string): Promise<void> {
    const filename = url.replace('/uploads/', '');
    const filepath = path.join(this.uploadPath, filename);

    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  }

  getUrl(path: string): string {
    return path;
  }
}
