import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { listModels, listDatasets } from '@/lib/queries';

export default async function HomePage() {
  const user = await getCurrentUser();
  const [models, datasets, userCount] = await Promise.all([
    listModels({ userId: user?.id, role: user?.role }),
    listDatasets({ userId: user?.id, role: user?.role }),
    prisma.user.count(),
  ]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <div>
          <h1>企业内部大模型与数据集管理平台</h1>
          <p className="muted">以 Hugging Face 的 repo 管理体验为灵感，先构建可运行 MVP，覆盖模型、数据集、版本、文件与权限基础流程。</p>
        </div>
        <div className="actions">
          <Link className="button" href="/models/new">新建模型</Link>
          <Link className="button secondary" href="/datasets/new">新建数据集</Link>
        </div>
      </section>

      <section className="stat-row">
        <div className="card"><div className="muted">模型总数</div><div className="kpi">{models.length}</div></div>
        <div className="card"><div className="muted">数据集总数</div><div className="kpi">{datasets.length}</div></div>
        <div className="card"><div className="muted">用户数</div><div className="kpi">{userCount}</div></div>
        <div className="card"><div className="muted">当前身份</div><div className="kpi" style={{ fontSize: 20 }}>{user ? `${user.name} (${user.role})` : '游客'}</div></div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="section-title">最近更新模型</h2>
            <Link href="/models">查看全部</Link>
          </div>
          <table className="table">
            <thead><tr><th>名称</th><th>负责人</th><th>任务</th><th>更新时间</th></tr></thead>
            <tbody>
              {models.slice(0, 5).map((model) => (
                <tr key={model.id}>
                  <td><Link href={`/models/${model.id}`}>{model.name}</Link></td>
                  <td>{model.ownerName}</td>
                  <td>{model.taskType}</td>
                  <td>{new Date(model.updatedAt).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="section-title">最近更新数据集</h2>
            <Link href="/datasets">查看全部</Link>
          </div>
          <table className="table">
            <thead><tr><th>名称</th><th>负责人</th><th>类型</th><th>更新时间</th></tr></thead>
            <tbody>
              {datasets.slice(0, 5).map((dataset) => (
                <tr key={dataset.id}>
                  <td><Link href={`/datasets/${dataset.id}`}>{dataset.name}</Link></td>
                  <td>{dataset.ownerName}</td>
                  <td>{dataset.datasetType}</td>
                  <td>{new Date(dataset.updatedAt).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
