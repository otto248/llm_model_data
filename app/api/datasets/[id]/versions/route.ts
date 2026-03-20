import { ResourceType } from '@prisma/client';
import { ensureDatasetAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { ok, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { versionSchema } from '@/lib/validators';

export const GET = withErrorHandling(async (_request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const dataset = await ensureDatasetAccess(params.id, user);
  return ok(dataset.versions);
});

export const POST = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  await ensureDatasetAccess(params.id, user, true);
  const payload = versionSchema.parse(await request.json());
  const version = await prisma.resourceVersion.create({
    data: {
      resourceType: ResourceType.DATASET,
      datasetId: params.id,
      version: payload.version,
      description: payload.description,
      fileIds: payload.fileIds,
      createdById: user.id,
    },
  });

  if (payload.setAsCurrent) {
    await prisma.dataset.update({ where: { id: params.id }, data: { currentVersionId: version.id } });
  }

  return ok(version, { status: 201 });
});
