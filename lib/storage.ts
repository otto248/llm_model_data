import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const uploadDir = process.env.UPLOAD_DIR || 'public/uploads';

export async function saveUploadedFile(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dir = path.join(process.cwd(), uploadDir, folder);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}-${file.name}`;
  const filePath = path.join(dir, filename);
  await writeFile(filePath, buffer);
  return {
    storagePath: filePath,
    relativePath: path.join(uploadDir, folder, filename),
    sizeBytes: buffer.byteLength,
    mimeType: file.type || 'application/octet-stream',
  };
}
