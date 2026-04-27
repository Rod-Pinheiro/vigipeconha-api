export interface IStorageService {
  upload(file: MulterFile): Promise<string>;
  uploadMultiple(files: MulterFile[]): Promise<string[]>;
  delete(url: string): Promise<void>;
  getUrl(path: string): string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}
