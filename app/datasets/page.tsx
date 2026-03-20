import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { listDatasets } from '@/lib/queries';
import { ResourceCard } from '@/components/ResourceCard';

export default async function DatasetsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const user = await getCurrentUser();
  const datasets = await listDatasets({
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
          <h1>数据集列表</h1>
          <p className="muted">支持按名称、标签、任务类型与可见性筛选，并展示样例数据入口。</p>
        </div>
        <Link className="button" href="/datasets/new">创建数据集</Link>
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
        {datasets.map((dataset) => (
          <ResourceCard
            key={dataset.id}
            href={`/datasets/${dataset.id}`}
            name={dataset.name}
            summary={dataset.summary}
            tags={dataset.tags}
            ownerName={dataset.ownerName}
            version={dataset.versions[0]?.version}
            visibility={dataset.visibility}
          />
        ))}
      </div>
    </div>
  );
}
