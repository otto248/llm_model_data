import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ResourceType, Visibility } from '@prisma/client';
import { AUTH_COOKIE } from './constants';
import { prisma } from './prisma';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
};

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAuthToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function getSessionUserFromToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return getSessionUserFromToken(token);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function getRequestUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return getSessionUserFromToken(token);
}

export async function canAccessResource(params: {
  user: SessionUser;
  ownerId: string;
  visibility: Visibility;
  resourceType: ResourceType;
  resourceId: string;
  write?: boolean;
}) {
  const { user, ownerId, visibility, resourceId, resourceType, write = false } = params;
  if (user.role === 'ADMIN') return true;
  if (ownerId === user.id) return true;
  const permission = await prisma.resourcePermission.findUnique({
    where: {
      resourceType_resourceId_userId: {
        resourceType,
        resourceId,
        userId: user.id,
      },
    },
  });
  if (permission && (write ? permission.canWrite : permission.canRead)) return true;
  if (!write && visibility !== 'PRIVATE') return true;
  return false;
}
