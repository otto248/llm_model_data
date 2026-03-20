import { ResourceType } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { fail, ok, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { listModels } from '@/lib/queries';
import { syncResourceTags } from '@/lib/resource-tags';
import { slugify, parseTags } from '@/lib/utils';
import { modelSchema } from '@/lib/validators';

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const user = await requireUser();
  const models = await listModels({
    q: searchParams.get('q') || undefined,
    tag: searchParams.get('tag') || undefined,
    taskType: searchParams.get('taskType') || undefined,
    visibility: searchParams.get('visibility') || undefined,
    ownerId: searchParams.get('ownerId') || undefined,
    userId: user.id,
    role: user.role,
  });
  return ok(models);
});

export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();
  const payload = modelSchema.parse(await request.json());
  const slug = slugify(payload.name);
  const existed = await prisma.model.findUnique({ where: { slug } });
  if (existed) return fail('模型名称已存在，请修改名称', 409);

  const model = await prisma.model.create({
    data: {
      slug,
      name: payload.name,
      summary: payload.summary,
      readme: payload.readme,
      modelType: payload.modelType,
      baseModel: payload.baseModel,
      taskType: payload.taskType,
      tags: parseTags(payload.tags),
      ownerId: user.id,
      ownerName: payload.ownerName,
      visibility: payload.visibility,
    },
  });

  await syncResourceTags(ResourceType.MODEL, model.id, model.tags);
  return ok(model, { status: 201 });
});
