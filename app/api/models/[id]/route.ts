import { ResourceType } from '@prisma/client';
import { ensureModelAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { ok, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { syncResourceTags } from '@/lib/resource-tags';
import { parseTags } from '@/lib/utils';
import { modelSchema } from '@/lib/validators';

export const GET = withErrorHandling(async (_request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const model = await ensureModelAccess(params.id, user);
  return ok(model);
});

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  await ensureModelAccess(params.id, user, true);
  const payload = modelSchema.parse(await request.json());
  const model = await prisma.model.update({
    where: { id: params.id },
    data: {
      name: payload.name,
      summary: payload.summary,
      readme: payload.readme,
      modelType: payload.modelType,
      baseModel: payload.baseModel,
      taskType: payload.taskType,
      tags: parseTags(payload.tags),
      ownerName: payload.ownerName,
      visibility: payload.visibility,
    },
  });
  await syncResourceTags(ResourceType.MODEL, model.id, model.tags);
  return ok(model);
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  await ensureModelAccess(params.id, user, true);
  await prisma.resourceTag.deleteMany({ where: { resourceType: ResourceType.MODEL, resourceId: params.id } });
  await prisma.resourceVersion.deleteMany({ where: { modelId: params.id } });
  await prisma.resourceFile.deleteMany({ where: { modelId: params.id } });
  await prisma.model.delete({ where: { id: params.id } });
  return ok({ success: true });
});
