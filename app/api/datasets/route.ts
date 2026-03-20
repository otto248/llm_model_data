import { ResourceType } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { fail, ok, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { listDatasets } from '@/lib/queries';
import { syncResourceTags } from '@/lib/resource-tags';
import { slugify, parseTags } from '@/lib/utils';
import { datasetSchema } from '@/lib/validators';

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const user = await requireUser();
  const datasets = await listDatasets({
    q: searchParams.get('q') || undefined,
    tag: searchParams.get('tag') || undefined,
    taskType: searchParams.get('taskType') || undefined,
    visibility: searchParams.get('visibility') || undefined,
    ownerId: searchParams.get('ownerId') || undefined,
    userId: user.id,
    role: user.role,
  });
  return ok(datasets);
});

export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();
  const payload = datasetSchema.parse(await request.json());
  const slug = slugify(payload.name);
  const existed = await prisma.dataset.findUnique({ where: { slug } });
  if (existed) return fail('数据集名称已存在，请修改名称', 409);

  const dataset = await prisma.dataset.create({
    data: {
      slug,
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
      ownerId: user.id,
      ownerName: payload.ownerName,
      visibility: payload.visibility,
      sampleData: payload.sampleData,
    },
  });

  await syncResourceTags(ResourceType.DATASET, dataset.id, dataset.tags);
  return ok(dataset, { status: 201 });
});
