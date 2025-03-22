import { promises as fsPromises } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Dosya yükleme işlemi için izin verilen dosya türleri
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Dosya boyut sınırı (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Dosya tipi kontrolü
export function isValidFileType(type: string, fileType: keyof typeof ALLOWED_FILE_TYPES = 'all'): boolean {
  return ALLOWED_FILE_TYPES[fileType].includes(type);
}

// Dosya boyutu kontrolü
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Base64 formatındaki veriyi dosyaya kaydet
export async function saveBase64File(base64Data: string, filename: string, directory: string): Promise<string | null> {
  try {
    // Base64 önekini kaldır
    const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '');
    
    // Hedef dizini oluştur
    const targetDir = path.join(process.cwd(), 'public', directory);
    await fsPromises.mkdir(targetDir, { recursive: true });
    
    // Benzersiz dosya adı oluştur
    const extension = path.extname(filename);
    const baseName = path.basename(filename, extension);
    const uniqueFileName = `${baseName}-${uuidv4().slice(0, 8)}${extension}`;
    
    // Dosya yolu
    const filePath = path.join(targetDir, uniqueFileName);
    const relativePath = path.join('/', directory, uniqueFileName);
    
    // Dosyayı kaydet
    await fsPromises.writeFile(filePath, Buffer.from(base64Content, 'base64'));
    
    return relativePath;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
}

// Dosyayı sil
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
    await fsPromises.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Dizindeki tüm dosyaları listele
export async function listFiles(directory: string): Promise<string[]> {
  try {
    const targetDir = path.join(process.cwd(), 'public', directory);
    const files = await fsPromises.readdir(targetDir);
    return files.map(file => path.join('/', directory, file));
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
} 