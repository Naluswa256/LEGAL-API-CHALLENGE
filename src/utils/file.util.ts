// src/core/utils/file.util.ts
import * as fs from 'fs';
import * as path from 'path';
import { FileUploadConfig } from 'src/common/configs/file-upload.config';
import { promisify } from 'util';


const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

export class FileUtil {
  static async saveFile(
    file: Express.Multer.File,
    subDirectory?: string
  ): Promise<string> {
    const uploadDir = subDirectory
      ? path.join(FileUploadConfig.uploadDirectory, subDirectory)
      : FileUploadConfig.uploadDirectory;

    await this.ensureDirectoryExists(uploadDir);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFileAsync(filePath, file.buffer);
    return path.join(uploadDir, filename).replace(/\\/g, '/');
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await unlinkAsync(filePath);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }

  private static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await mkdirAsync(dirPath, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory ${dirPath}:`, err);
      throw err;
    }
  }
}