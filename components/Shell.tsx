import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export async function Shell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <header className="header">
        <div className="brand">Mini Hugging Face</div>
        <nav className="nav">
          <Link href="/">总览</Link>
          <Link href="/models">模型</Link>
          <Link href="/datasets">数据集</Link>
          {user ? <span className="muted">{user.name} / {user.role}</span> : <Link href="/login">登录</Link>}
        </nav>
      </header>
      <main>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
