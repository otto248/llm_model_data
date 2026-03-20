export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function parseTags(tags: string | string[] | undefined | null) {
  if (!tags) return [];
  if (Array.isArray(tags)) return Array.from(new Set(tags.filter(Boolean)));
  return Array.from(
    new Set(
      tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function bytesToSize(value: bigint | number) {
  const bytes = typeof value === 'bigint' ? Number(value) : value;
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let current = bytes / 1024;
  let unit = 0;
  while (current >= 1024 && unit < units.length - 1) {
    current /= 1024;
    unit += 1;
  }
  return `${current.toFixed(1)} ${units[unit]}`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
