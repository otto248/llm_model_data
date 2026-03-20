import { NextResponse } from 'next/server';

function serialize(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  );
}

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json(serialize(data), init);
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export function withErrorHandling<T extends any[]>(handler: (...args: T) => Promise<Response>) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        return fail('未登录或登录已过期', 401);
      }
      return fail(error instanceof Error ? error.message : '服务异常', 500);
    }
  };
}
