import { ResourceType } from '@prisma/client';
import { ensureModelAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { ok, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/storage';

export const GET = withErrorHandling(async (_request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const model = await ensureModelAccess(params.id, user);
  return ok(model.files);
});

export const POST = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const model = await ensureModelAccess(params.id, user, true);
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) throw new Error('请选择上传文件');
  const stored = await saveUploadedFile(file, `models/${params.id}`);

  const created = await prisma.resourceFile.create({
    data: {
      resourceType: ResourceType.MODEL,
      modelId: params.id,
      name: file.name,
      storagePath: stored.relativePath,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      uploadedById: user.id,
      ownerName: model.ownerName,
    },
  });
  return ok(created, { status: 201 });
});
