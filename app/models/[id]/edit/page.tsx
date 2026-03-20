import { redirect } from 'next/navigation';
import { ensureModelAccess } from '@/lib/access';
import { requireUser } from '@/lib/auth';
import { ResourceForm } from '@/components/ResourceForm';

export default async function EditModelPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect('/login');
  }
  const model = await ensureModelAccess(params.id, user!, true);
  return (
    <div>
      <h1 className="section-title">编辑模型</h1>
      <ResourceForm type="model" initialData={model} submitUrl={`/api/models/${model.id}`} method="PUT" />
    </div>
  );
}
