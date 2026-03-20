import { PrismaClient, ResourceType, UserRole, Visibility } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const userEmail = process.env.SEED_USER_EMAIL ?? 'user@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'User123!';

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(userPassword, 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Admin',
      role: UserRole.ADMIN,
      passwordHash: adminHash,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: 'ML Engineer',
      role: UserRole.USER,
      passwordHash: userHash,
    },
  });

  const tagNames = ['chat', 'finance', 'evaluation', 'embedding', 'sft'];
  await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const model = await prisma.model.upsert({
    where: { slug: 'enterprise-chat-7b' },
    update: {},
    create: {
      slug: 'enterprise-chat-7b',
      name: 'Enterprise Chat 7B',
      summary: '企业内部知识问答的默认聊天模型。',
      readme: '# Enterprise Chat 7B\n\n适用于企业知识库问答、工单摘要与通用对话。',
      modelType: 'LLM',
      baseModel: 'Llama 3.1 8B',
      taskType: 'chat',
      tags: ['chat', 'finance'],
      ownerId: admin.id,
      ownerName: admin.name,
      visibility: Visibility.INTERNAL,
    },
  });

  const dataset = await prisma.dataset.upsert({
    where: { slug: 'customer-support-sft' },
    update: {},
    create: {
      slug: 'customer-support-sft',
      name: 'Customer Support SFT',
      summary: '客服问答场景 SFT 数据集。',
      readme: '# Customer Support SFT\n\n包含客服历史问答与标准化回复模板。',
      datasetType: 'sft',
      taskType: 'chat',
      tags: ['chat', 'sft'],
      source: '内部工单系统',
      recordCount: 12000,
      fileCount: 2,
      sizeBytes: BigInt(25 * 1024 * 1024),
      format: 'jsonl',
      ownerId: user.id,
      ownerName: user.name,
      visibility: Visibility.INTERNAL,
      sampleData: [
        { instruction: '用户咨询退款进度', output: '请先核对订单号并在 CRM 系统中查询...' },
        { instruction: '用户要求修改配送地址', output: '请确认订单状态是否允许修改...' },
      ],
    },
  });

  const modelVersion = await prisma.resourceVersion.upsert({
    where: { modelId_version: { modelId: model.id, version: 'v1' } },
    update: {},
    create: {
      resourceType: ResourceType.MODEL,
      modelId: model.id,
      version: 'v1',
      description: '初始版本，可用于企业内部测试。',
      createdById: admin.id,
    },
  });

  const datasetVersion = await prisma.resourceVersion.upsert({
    where: { datasetId_version: { datasetId: dataset.id, version: 'v1' } },
    update: {},
    create: {
      resourceType: ResourceType.DATASET,
      datasetId: dataset.id,
      version: 'v1',
      description: '首批清洗后的客服问答数据。',
      createdById: user.id,
    },
  });

  await prisma.model.update({
    where: { id: model.id },
    data: { currentVersionId: modelVersion.id },
  });

  await prisma.dataset.update({
    where: { id: dataset.id },
    data: { currentVersionId: datasetVersion.id },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
