import { ResourceForm } from '@/components/ResourceForm';

export default function NewModelPage() {
  return (
    <div>
      <h1 className="section-title">创建模型</h1>
      <ResourceForm type="model" submitUrl="/api/models" />
    </div>
  );
}
