import { ResourceType } from '@prisma/client';
import { prisma } from './prisma';

export async function syncResourceTags(resourceType: ResourceType, resourceId: string, tags: string[]) {
  const uniqueTags = Array.from(new Set(tags.filter(Boolean)));
  const tagRecords = await Promise.all(
    uniqueTags.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  await prisma.resourceTag.deleteMany({ where: { resourceType, resourceId } });
  if (!tagRecords.length) return;
  await prisma.resourceTag.createMany({
    data: tagRecords.map((tag) => ({
      resourceType,
      resourceId,
      tagId: tag.id,
    })),
    skipDuplicates: true,
  });
}
