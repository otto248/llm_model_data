'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: '登录失败' }));
      setError(result.error || '登录失败');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <form className="card" onSubmit={onSubmit}>
        <h1 className="section-title">登录</h1>
        <p className="muted">使用管理员或普通用户账号登录，进入企业内部资源管理平台。</p>
        <div className="field">
          <label>邮箱</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p style={{ color: '#c92a2a' }}>{error}</p> : null}
        <button type="submit">登录</button>
      </form>
    </div>
  );
}
