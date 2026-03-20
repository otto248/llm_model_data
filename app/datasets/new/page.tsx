import { ResourceForm } from '@/components/ResourceForm';

export default function NewDatasetPage() {
  return (
    <div>
      <h1 className="section-title">创建数据集</h1>
      <ResourceForm type="dataset" submitUrl="/api/datasets" />
    </div>
  );
}
