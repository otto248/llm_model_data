import { ResourceType } from '@prisma/client';
import { ensureDatasetAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { ok, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { syncResourceTags } from '@/lib/resource-tags';
import { parseTags } from '@/lib/utils';
import { datasetSchema } from '@/lib/validators';

export const GET = withErrorHandling(async (_request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const dataset = await ensureDatasetAccess(params.id, user);
  return ok(dataset);
});

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  await ensureDatasetAccess(params.id, user, true);
  const payload = datasetSchema.parse(await request.json());
  const dataset = await prisma.dataset.update({
    where: { id: params.id },
    data: {
      name: payload.name,
      summary: payload.summary,
      readme: payload.readme,
      datasetType: payload.datasetType,
      taskType: payload.taskType,
      tags: parseTags(payload.tags),
      source: payload.source,
      recordCount: payload.recordCount,
      fileCount: payload.fileCount,
      sizeBytes: payload.sizeBytes,
      format: payload.format,
      ownerName: payload.ownerName,
      visibility: payload.visibility,
      sampleData: payload.sampleData,
    },
  });
  await syncResourceTags(ResourceType.DATASET, dataset.id, dataset.tags);
  return ok(dataset);
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  await ensureDatasetAccess(params.id, user, true);
  await prisma.resourceTag.deleteMany({ where: { resourceType: ResourceType.DATASET, resourceId: params.id } });
  await prisma.resourceVersion.deleteMany({ where: { datasetId: params.id } });
  await prisma.resourceFile.deleteMany({ where: { datasetId: params.id } });
  await prisma.dataset.delete({ where: { id: params.id } });
  return ok({ success: true });
});
