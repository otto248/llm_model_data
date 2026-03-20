'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function VersionForm({ resourceType, resourceId }: { resourceType: 'models' | 'datasets'; resourceId: string }) {
  const [version, setVersion] = useState('v1');
  const [description, setDescription] = useState('');
  const [setAsCurrent, setSetAsCurrent] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/${resourceType}/${resourceId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, description, fileIds: [], setAsCurrent }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: '版本创建失败' }));
      setError(result.error || '版本创建失败');
      return;
    }
    setVersion('v1');
    setDescription('');
    router.refresh();
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3 className="section-title">新增版本</h3>
      <div className="grid grid-2">
        <div className="field">
          <label>版本号</label>
          <input value={version} onChange={(e) => setVersion(e.target.value)} />
        </div>
        <div className="field">
          <label>设为当前版本</label>
          <select value={setAsCurrent ? 'yes' : 'no'} onChange={(e) => setSetAsCurrent(e.target.value === 'yes')}>
            <option value="yes">是</option>
            <option value="no">否</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>版本说明</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error ? <p style={{ color: '#c92a2a' }}>{error}</p> : null}
      <button type="submit">创建版本</button>
    </form>
  );
}
