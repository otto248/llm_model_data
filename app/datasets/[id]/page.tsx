import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MarkdownView } from '@/components/MarkdownView';
import { FileUploadForm } from '@/components/FileUploadForm';
import { VersionForm } from '@/components/VersionForm';
import { ensureDatasetAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { bytesToSize, formatDate } from '@/lib/utils';

export default async function DatasetDetailPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect('/login');
  }
  const dataset = await ensureDatasetAccess(params.id, user!);
  const sampleData = Array.isArray(dataset.sampleData) ? dataset.sampleData : [];

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <div>
          <h1>{dataset.name}</h1>
          <p className="muted">{dataset.summary}</p>
          <div>
            {dataset.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
            <span className="badge">{dataset.datasetType}</span>
            <span className="badge">{dataset.taskType}</span>
            <span className="badge">{dataset.visibility}</span>
          </div>
        </div>
        <div className="actions">
          <Link className="button" href={`/datasets/${dataset.id}/edit`}>编辑数据集</Link>
        </div>
      </section>
      <section className="grid grid-2">
        <div className="card">
          <h2 className="section-title">基本信息</h2>
          <table className="table">
            <tbody>
              <tr><th>ID</th><td><span className="code">{dataset.id}</span></td></tr>
              <tr><th>来源</th><td>{dataset.source}</td></tr>
              <tr><th>规模</th><td>{dataset.recordCount} 条 / {dataset.fileCount} 文件 / {bytesToSize(dataset.sizeBytes)}</td></tr>
              <tr><th>格式</th><td>{dataset.format}</td></tr>
              <tr><th>负责人</th><td>{dataset.ownerName}</td></tr>
            </tbody>
          </table>
        </div>
        <VersionForm resourceType="datasets" resourceId={dataset.id} />
      </section>
      <section className="grid grid-2">
        <div className="card">
          <h2 className="section-title">README</h2>
          <MarkdownView content={dataset.readme} />
        </div>
        <FileUploadForm resourceType="datasets" resourceId={dataset.id} />
      </section>
      <section className="grid grid-2">
        <div className="card">
          <h2 className="section-title">版本历史</h2>
          <table className="table">
            <thead><tr><th>版本</th><th>说明</th><th>创建时间</th></tr></thead>
            <tbody>
              {dataset.versions.map((version) => (
                <tr key={version.id}><td>{version.version}</td><td>{version.description}</td><td>{formatDate(version.createdAt)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2 className="section-title">文件列表</h2>
          <table className="table">
            <thead><tr><th>文件名</th><th>大小</th><th>上传时间</th><th>下载</th></tr></thead>
            <tbody>
              {dataset.files.map((file) => (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>{bytesToSize(file.sizeBytes)}</td>
                  <td>{formatDate(file.uploadedAt)}</td>
                  <td><Link href={`/api/files/${file.id}/download`}>下载</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h2 className="section-title">样例数据预览（前 20 条）</h2>
        <pre style={{ overflow: 'auto', background: '#111827', color: 'white', padding: 16, borderRadius: 12 }}>
          {JSON.stringify(sampleData.slice(0, 20), null, 2)}
        </pre>
      </section>
    </div>
  );
}
