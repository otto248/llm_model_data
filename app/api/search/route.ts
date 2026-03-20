import { requireUser } from '@/lib/auth';
import { ok, withErrorHandling } from '@/lib/api';
import { listDatasets, listModels } from '@/lib/queries';

export const GET = withErrorHandling(async (request: Request) => {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = {
    q: searchParams.get('q') || undefined,
    tag: searchParams.get('tag') || undefined,
    taskType: searchParams.get('taskType') || undefined,
    visibility: searchParams.get('visibility') || undefined,
    ownerId: searchParams.get('ownerId') || undefined,
    userId: user.id,
    role: user.role,
  } as const;

  if (type === 'dataset') {
    return ok(await listDatasets(query));
  }
  if (type === 'model') {
    return ok(await listModels(query));
  }

  const [models, datasets] = await Promise.all([listModels(query), listDatasets(query)]);
  return ok({ models, datasets });
});
