import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { listModels } from '@/lib/queries';
import { ResourceCard } from '@/components/ResourceCard';

export default async function ModelsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const user = await getCurrentUser();
  const models = await listModels({
    q: typeof searchParams?.q === 'string' ? searchParams.q : undefined,
    tag: typeof searchParams?.tag === 'string' ? searchParams.tag : undefined,
    taskType: typeof searchParams?.taskType === 'string' ? searchParams.taskType : undefined,
    visibility: typeof searchParams?.visibility === 'string' ? searchParams.visibility : undefined,
    userId: user?.id,
    role: user?.role,
  });

  return (
    <div>
      <div className="hero">
        <div>
          <h1>模型列表</h1>
          <p className="muted">按名称、标签、任务类型与可见性筛选，优先支撑内部 LLM 资产管理。</p>
        </div>
        <Link className="button" href="/models/new">创建模型</Link>
      </div>
      <form className="card filters">
        <input name="q" placeholder="关键词" defaultValue={typeof searchParams?.q === 'string' ? searchParams.q : ''} />
        <input name="tag" placeholder="标签" defaultValue={typeof searchParams?.tag === 'string' ? searchParams.tag : ''} />
        <input name="taskType" placeholder="任务类型" defaultValue={typeof searchParams?.taskType === 'string' ? searchParams.taskType : ''} />
        <select name="visibility" defaultValue={typeof searchParams?.visibility === 'string' ? searchParams.visibility : ''}>
          <option value="">全部可见性</option>
          <option value="PRIVATE">private</option>
          <option value="INTERNAL">internal</option>
          <option value="PUBLIC">public</option>
        </select>
        <button type="submit">搜索</button>
      </form>
      <div className="grid grid-3">
        {models.map((model) => (
          <ResourceCard
            key={model.id}
            href={`/models/${model.id}`}
            name={model.name}
            summary={model.summary}
            tags={model.tags}
            ownerName={model.ownerName}
            version={model.versions[0]?.version}
            visibility={model.visibility}
          />
        ))}
      </div>
    </div>
  );
}
