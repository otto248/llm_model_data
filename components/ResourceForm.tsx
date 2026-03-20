'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ResourceFormProps = {
  type: 'model' | 'dataset';
  initialData?: Record<string, any>;
  submitUrl: string;
  method?: 'POST' | 'PUT';
};

export function ResourceForm({ type, initialData, submitUrl, method = 'POST' }: ResourceFormProps) {
  const [form, setForm] = useState<Record<string, any>>({
    name: initialData?.name ?? '',
    summary: initialData?.summary ?? '',
    readme: initialData?.readme ?? `# ${type === 'model' ? '模型' : '数据集'} README`,
    modelType: initialData?.modelType ?? 'LLM',
    baseModel: initialData?.baseModel ?? '',
    datasetType: initialData?.datasetType ?? 'sft',
    taskType: initialData?.taskType ?? 'chat',
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(',') : initialData?.tags ?? '',
    ownerName: initialData?.ownerName ?? '',
    visibility: initialData?.visibility ?? 'INTERNAL',
    source: initialData?.source ?? '',
    recordCount: initialData?.recordCount ?? 0,
    fileCount: initialData?.fileCount ?? 0,
    sizeBytes: initialData?.sizeBytes ?? 0,
    format: initialData?.format ?? 'jsonl',
    sampleData: initialData?.sampleData ? JSON.stringify(initialData.sampleData, null, 2) : '[]',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      sampleData: type === 'dataset' ? JSON.parse(form.sampleData || '[]') : undefined,
    };

    const response = await fetch(submitUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: '提交失败' }));
      setError(result.error || '提交失败');
      return;
    }

    const result = await response.json();
    router.push(type === 'model' ? `/models/${result.id}` : `/datasets/${result.id}`);
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="field">
        <label>名称</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="field">
        <label>简介</label>
        <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required />
      </div>
      <div className="field">
        <label>README</label>
        <textarea value={form.readme} onChange={(e) => setForm({ ...form, readme: e.target.value })} required />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label>{type === 'model' ? '模型类型' : '数据集类型'}</label>
          <input value={type === 'model' ? form.modelType : form.datasetType} onChange={(e) => setForm({ ...form, [type === 'model' ? 'modelType' : 'datasetType']: e.target.value })} required />
        </div>
        <div className="field">
          <label>任务类型</label>
          <input value={form.taskType} onChange={(e) => setForm({ ...form, taskType: e.target.value })} required />
        </div>
      </div>
      {type === 'model' ? (
        <div className="field">
          <label>基础模型</label>
          <input value={form.baseModel} onChange={(e) => setForm({ ...form, baseModel: e.target.value })} />
        </div>
      ) : (
        <>
          <div className="field">
            <label>数据来源</label>
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required />
          </div>
          <div className="grid grid-3">
            <div className="field">
              <label>记录数</label>
              <input type="number" value={form.recordCount} onChange={(e) => setForm({ ...form, recordCount: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>文件数</label>
              <input type="number" value={form.fileCount} onChange={(e) => setForm({ ...form, fileCount: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>大小（字节）</label>
              <input type="number" value={form.sizeBytes} onChange={(e) => setForm({ ...form, sizeBytes: Number(e.target.value) })} />
            </div>
          </div>
          <div className="field">
            <label>数据格式</label>
            <input value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} required />
          </div>
          <div className="field">
            <label>样例数据 JSON</label>
            <textarea value={form.sampleData} onChange={(e) => setForm({ ...form, sampleData: e.target.value })} />
          </div>
        </>
      )}
      <div className="grid grid-2">
        <div className="field">
          <label>标签（逗号分隔）</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <div className="field">
          <label>负责人</label>
          <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required />
        </div>
      </div>
      <div className="field">
        <label>可见性</label>
        <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
          <option value="PRIVATE">private</option>
          <option value="INTERNAL">internal</option>
          <option value="PUBLIC">public</option>
        </select>
      </div>
      {error ? <p style={{ color: '#c92a2a' }}>{error}</p> : null}
      <button type="submit">保存</button>
    </form>
  );
}
