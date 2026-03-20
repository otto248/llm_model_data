'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function FileUploadForm({ resourceType, resourceId }: { resourceType: 'models' | 'datasets'; resourceId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError('请选择文件');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`/api/${resourceType}/${resourceId}/files`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: '上传失败' }));
      setError(result.error || '上传失败');
      return;
    }
    setError('');
    setFile(null);
    router.refresh();
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3 className="section-title">上传文件</h3>
      <div className="field">
        <label>本地文件</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      {error ? <p style={{ color: '#c92a2a' }}>{error}</p> : null}
      <button type="submit">上传</button>
    </form>
  );
}
