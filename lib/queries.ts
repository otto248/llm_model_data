import { Prisma, ResourceType } from '@prisma/client';
import { prisma } from './prisma';

async function getReadableIds(resourceType: ResourceType, userId?: string, role?: 'ADMIN' | 'USER') {
  if (!userId || role === 'ADMIN') return [];
  const permissions = await prisma.resourcePermission.findMany({
    where: { userId, canRead: true, resourceType },
    select: { resourceId: true },
  });
  return permissions.map((item) => item.resourceId);
}

export async function listModels(params: {
  q?: string;
  tag?: string;
  taskType?: string;
  visibility?: string;
  ownerId?: string;
  userId?: string;
  role?: 'ADMIN' | 'USER';
}) {
  const readableIds = await getReadableIds(ResourceType.MODEL, params.userId, params.role);
  const where: Prisma.ModelWhereInput = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: 'insensitive' } },
            { summary: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(params.tag ? { tags: { has: params.tag } } : {}),
    ...(params.taskType ? { taskType: params.taskType } : {}),
    ...(params.visibility ? { visibility: params.visibility as never } : {}),
    ...(params.ownerId ? { ownerId: params.ownerId } : {}),
    ...(params.role === 'ADMIN'
      ? {}
      : params.userId
        ? {
            OR: [
              { visibility: { in: ['INTERNAL', 'PUBLIC'] } },
              { ownerId: params.userId },
              ...(readableIds.length ? [{ id: { in: readableIds } }] : []),
            ],
          }
        : { visibility: 'PUBLIC' }),
  };
  return prisma.model.findMany({
    where,
    include: {
      versions: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { uploadedAt: 'desc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function listDatasets(params: {
  q?: string;
  tag?: string;
  taskType?: string;
  visibility?: string;
  ownerId?: string;
  userId?: string;
  role?: 'ADMIN' | 'USER';
}) {
  const readableIds = await getReadableIds(ResourceType.DATASET, params.userId, params.role);
  const where: Prisma.DatasetWhereInput = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: 'insensitive' } },
            { summary: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(params.tag ? { tags: { has: params.tag } } : {}),
    ...(params.taskType ? { taskType: params.taskType } : {}),
    ...(params.visibility ? { visibility: params.visibility as never } : {}),
    ...(params.ownerId ? { ownerId: params.ownerId } : {}),
    ...(params.role === 'ADMIN'
      ? {}
      : params.userId
        ? {
            OR: [
              { visibility: { in: ['INTERNAL', 'PUBLIC'] } },
              { ownerId: params.userId },
              ...(readableIds.length ? [{ id: { in: readableIds } }] : []),
            ],
          }
        : { visibility: 'PUBLIC' }),
  };
  return prisma.dataset.findMany({
    where,
    include: {
      versions: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { uploadedAt: 'desc' } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}
