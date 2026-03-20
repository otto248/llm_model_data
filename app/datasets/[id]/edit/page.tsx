import { redirect } from 'next/navigation';
import { ensureDatasetAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { ResourceForm } from '@/components/ResourceForm';

export default async function EditDatasetPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect('/login');
  }
  const dataset = await ensureDatasetAccess(params.id, user!, true);
  return (
    <div>
      <h1 className="section-title">编辑数据集</h1>
      <ResourceForm type="dataset" initialData={{ ...dataset, sizeBytes: Number(dataset.sizeBytes) }} submitUrl={`/api/datasets/${dataset.id}`} method="PUT" />
    </div>
  );
}
