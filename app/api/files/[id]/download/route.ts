import { readFile } from 'fs/promises';
import path from 'path';
import { ensureDatasetAccess, ensureModelAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { fail, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const GET = withErrorHandling(async (_request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const file = await prisma.resourceFile.findUnique({ where: { id: params.id } });
  if (!file) return fail('文件不存在', 404);

  if (file.modelId) await ensureModelAccess(file.modelId, user);
  if (file.datasetId) await ensureDatasetAccess(file.datasetId, user);

  const fullPath = path.isAbsolute(file.storagePath) ? file.storagePath : path.join(process.cwd(), file.storagePath);
  const buffer = await readFile(fullPath);

  return new Response(buffer, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
    },
  });
});
