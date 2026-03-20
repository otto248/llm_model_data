import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MarkdownView } from '@/components/MarkdownView';
import { FileUploadForm } from '@/components/FileUploadForm';
import { VersionForm } from '@/components/VersionForm';
import { ensureModelAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { bytesToSize, formatDate } from '@/lib/utils';

export default async function ModelDetailPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect('/login');
  }
  const model = await ensureModelAccess(params.id, user!);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="hero">
        <div>
          <h1>{model.name}</h1>
          <p className="muted">{model.summary}</p>
          <div>
            {model.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
            <span className="badge">{model.modelType}</span>
            <span className="badge">{model.taskType}</span>
            <span className="badge">{model.visibility}</span>
          </div>
        </div>
        <div className="actions">
          <Link className="button" href={`/models/${model.id}/edit`}>编辑模型</Link>
        </div>
      </section>
      <section className="grid grid-2">
        <div className="card">
          <h2 className="section-title">基本信息</h2>
          <table className="table">
            <tbody>
              <tr><th>ID</th><td><span className="code">{model.id}</span></td></tr>
              <tr><th>基础模型</th><td>{model.baseModel ?? '-'}</td></tr>
              <tr><th>负责人</th><td>{model.ownerName}</td></tr>
              <tr><th>创建时间</th><td>{formatDate(model.createdAt)}</td></tr>
              <tr><th>更新时间</th><td>{formatDate(model.updatedAt)}</td></tr>
            </tbody>
          </table>
        </div>
        <VersionForm resourceType="models" resourceId={model.id} />
      </section>
      <section className="grid grid-2">
        <div className="card">
          <h2 className="section-title">README</h2>
          <MarkdownView content={model.readme} />
        </div>
        <FileUploadForm resourceType="models" resourceId={model.id} />
      </section>
      <section className="grid grid-2">
        <div className="card">
          <h2 className="section-title">版本历史</h2>
          <table className="table">
            <thead><tr><th>版本</th><th>说明</th><th>创建时间</th></tr></thead>
            <tbody>
              {model.versions.map((version) => (
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
              {model.files.map((file) => (
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
    </div>
  );
}
