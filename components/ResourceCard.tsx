import Link from 'next/link';

export function ResourceCard({
  href,
  name,
  summary,
  tags,
  ownerName,
  version,
  visibility,
}: {
  href: string;
  name: string;
  summary: string;
  tags: string[];
  ownerName: string;
  version?: string | null;
  visibility: string;
}) {
  return (
    <Link className="card list-card" href={href}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <strong>{name}</strong>
        <span className="badge">{visibility}</span>
      </div>
      <div className="muted">{summary}</div>
      <div>
        {tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
      <div className="muted">负责人：{ownerName} · 当前版本：{version ?? '未设置'}</div>
    </Link>
  );
}
