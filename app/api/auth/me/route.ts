import { getCurrentUser } from '@/lib/auth';
import { ok, withErrorHandling } from '@/lib/api';

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUser();
  return ok({ user });
});
