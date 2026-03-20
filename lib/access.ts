import { ResourceType } from '@prisma/client';
import { prisma } from './prisma';
import { SessionUser, canAccessResource } from './auth';

export async function ensureModelAccess(modelId: string, user: SessionUser, write = false) {
  const model = await prisma.model.findUnique({
    where: { id: modelId },
    include: {
      versions: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { uploadedAt: 'desc' } },
    },
  });
  if (!model) throw new Error('模型不存在');
  const allowed = await canAccessResource({
    user,
    ownerId: model.ownerId,
    visibility: model.visibility,
    resourceId: model.id,
    resourceType: ResourceType.MODEL,
    write,
  });
  if (!allowed) throw new Error(write ? '没有模型写入权限' : '没有模型访问权限');
  return model;
}

export async function ensureDatasetAccess(datasetId: string, user: SessionUser, write = false) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
    include: {
      versions: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { uploadedAt: 'desc' } },
    },
  });
  if (!dataset) throw new Error('数据集不存在');
  const allowed = await canAccessResource({
    user,
    ownerId: dataset.ownerId,
    visibility: dataset.visibility,
    resourceId: dataset.id,
    resourceType: ResourceType.DATASET,
    write,
  });
  if (!allowed) throw new Error(write ? '没有数据集写入权限' : '没有数据集访问权限');
  return dataset;
}
