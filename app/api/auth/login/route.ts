import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createAuthToken, verifyPassword } from '@/lib/auth';
import { AUTH_COOKIE } from '@/lib/constants';
import { loginSchema } from '@/lib/validators';
import { fail, ok, withErrorHandling } from '@/lib/api';

export const POST = withErrorHandling(async (request: Request) => {
  const body = loginSchema.parse(await request.json());
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return fail('账号或密码错误', 401);
  const matched = await verifyPassword(body.password, user.passwordHash);
  if (!matched) return fail('账号或密码错误', 401);

  const token = await createAuthToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return ok({ id: user.id, email: user.email, name: user.name, role: user.role });
});
