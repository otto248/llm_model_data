import { ok, withErrorHandling } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const GET = withErrorHandling(async () => {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  return ok(tags);
});
