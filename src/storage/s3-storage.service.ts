import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { IStorageService, MulterFile } from './storage.service.interface';
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET || 'vigipeconha';
    this.baseUrl =
      process.env.MINIO_BASE_URL || `http://minio:9000/${this.bucket}`;

    this.s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT || 'http://minio:9000',
      region: process.env.MINIO_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  async upload(file: MulterFile): Promise<string> {
    const ext = path.extname(file.originalname);
    const key = `notificacoes/${uuidv4()}${ext}`;

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();
      return this.getUrl(key);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  async uploadMultiple(files: MulterFile[]): Promise<string[]> {
    const urls = await Promise.all(files.map((file) => this.upload(file)));
    return urls;
  }

  async delete(url: string): Promise<void> {
    const key = this.extractKey(url);
    if (!key) return;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      this.logger.warn(`Failed to delete file: ${error.message}`);
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  private extractKey(url: string): string | null {
    const baseUrlPattern = this.baseUrl.replace(/^https?:\/\//, '');
    const match = url
      .replace(/^https?:\/\//, '')
      .replace(baseUrlPattern + '/', '');
    return match || null;
  }

  async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: '' }),
      );
    } catch {
      this.logger.warn(
        `Bucket ${this.bucket} does not exist. Create it manually.`,
      );
    }
  }
}
