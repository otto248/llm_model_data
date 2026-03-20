# Mini Hugging Face（企业内部模型/数据集管理平台 MVP）

> 一个从 0 到 1 构建的“简化版 Hugging Face”示例项目，聚焦企业内部大模型与数据集资产管理，优先跑通 MVP 主流程：登录、列表、详情、创建/编辑、版本管理、文件上传下载、基础权限控制。

---

## 第一步：系统设计

### 1. 系统架构图（文字描述）

```text
┌────────────────────────────────────────────────────────────┐
│                        Web Browser                         │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│                  Next.js App Router UI                     │
│  - 登录页                                                  │
│  - 首页/总览页                                             │
│  - 模型列表/详情/创建/编辑                                 │
│  - 数据集列表/详情/创建/编辑                               │
└───────────────────────┬────────────────────────────────────┘
                        │ Server Components / Route Handlers
                        ▼
┌────────────────────────────────────────────────────────────┐
│                    Next.js API Layer                       │
│  - auth/login, auth/me                                     │
│  - models CRUD                                             │
│  - datasets CRUD                                           │
│  - versions CRUD                                           │
│  - files upload/list/download                              │
│  - tags/search                                             │
└───────────────────────┬────────────────────────────────────┘
                        │ Prisma ORM
                        ▼
┌────────────────────────────────────────────────────────────┐
│                      PostgreSQL                            │
│  - users                                                   │
│  - models / datasets                                       │
│  - resource_versions                                       │
│  - resource_files                                          │
│  - tags / resource_tags / permissions                      │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│                    File Storage Abstraction                │
│  - 当前：本地存储 public/uploads                           │
│  - 预留：MinIO / S3 / OSS                                  │
└────────────────────────────────────────────────────────────┘
```

### 2. 技术栈选择理由

- **前后端一体化：Next.js 14 + TypeScript**
  - 适合快速搭建 MVP。
  - 页面、API、鉴权、中后台风格 UI 可以统一在一个工程内维护。
  - 降低前后端联调成本，便于后续拆分服务。
- **ORM：Prisma**
  - 建模清晰，适合从 ER 到可运行代码快速落地。
  - 支持 PostgreSQL，迁移和种子数据体验好。
- **数据库：PostgreSQL**
  - 企业内部常见，支持 JSON、数组、索引、扩展性强。
- **鉴权：JWT + HttpOnly Cookie**
  - 实现简单、维护成本低。
  - 支持登录后 API 与页面读取会话状态。
- **文件存储：本地存储 + 抽象层**
  - MVP 先把上传下载流程跑通。
  - 通过 `lib/storage.ts` 预留对象存储替换点。

### 3. 模块划分

- `app/`：页面与 API Route Handler。
- `components/`：中后台 UI 组件，如资源卡片、表单、版本表单、文件上传表单。
- `lib/`：基础设施与业务工具，包括 Prisma、鉴权、权限校验、查询、校验器、存储抽象。
- `prisma/`：数据库 schema 与 seed 初始化脚本。
- `public/uploads/`：本地文件存储目录。

### 4. 核心数据流

#### 4.1 登录流程
1. 用户在登录页输入邮箱密码。
2. `POST /api/auth/login` 校验用户密码。
3. 登录成功后签发 JWT，写入 HttpOnly Cookie。
4. 页面与 API 通过 Cookie 获取当前用户身份。

#### 4.2 创建模型/数据集流程
1. 用户提交创建表单。
2. API 使用 Zod 做参数校验。
3. 生成 slug，写入 `models` 或 `datasets`。
4. 同步标签到 `tags` 与 `resource_tags`。
5. 返回资源详情，跳转详情页。

#### 4.3 版本管理流程
1. 在详情页填写版本号与说明。
2. 写入 `resource_versions`。
3. 若勾选“设为当前版本”，更新资源表中的 `currentVersionId`。

#### 4.4 文件上传下载流程
1. 前端通过 `multipart/form-data` 上传文件。
2. `lib/storage.ts` 保存到本地目录。
3. `resource_files` 保存元数据（文件名、大小、MIME、存储路径、上传时间等）。
4. 下载时根据文件 ID 校验权限后返回二进制流。

#### 4.5 权限判断流程
- 管理员：可读写所有资源。
- 普通用户：可读写自己创建的资源。
- 对于他人资源：
  - `public/internal` 默认可读。
  - `private` 仅 owner 或被显式授权用户可读。
  - 写权限只允许 owner / admin / 显式写权限用户。

### 5. 数据库 ER 设计说明

- `users`：平台用户，包含角色与密码哈希。
- `models` / `datasets`：核心资源主表，存储元数据、README、可见性、当前版本等。
- `resource_versions`：统一版本表，用 `resourceType + modelId/datasetId` 区分。
- `resource_files`：统一文件表，用于记录模型/数据集文件。
- `tags`：标签字典。
- `resource_tags`：标签关联表。
- `permissions`：资源粒度的显式授权。

> 说明：为保证 MVP 简洁，版本与文件采用统一表设计，前端按模型/数据集分开展示；后续如果版本规则复杂，可以拆为 `model_versions` / `dataset_versions` 两张实体表。

### 6. MVP 边界与后续扩展建议

#### MVP 已覆盖
- 登录与基础角色权限
- 模型/数据集 CRUD
- 列表检索与筛选
- 详情页 README、版本历史、文件列表
- 文件上传/下载
- 样例数据预览
- 初始化数据脚本

#### 暂不做
- 社区评论、点赞、组织空间
- Git-like repo 提交历史
- 在线预览大文件、分片上传
- 审批流、审计日志、SSO、LDAP
- 模型评测面板、推理服务接入

#### 后续建议
1. 接入 MinIO / S3，文件表支持 bucket、objectKey、presigned URL。
2. 增加组织/团队空间与项目归属。
3. 将显式权限扩展为角色模板（Viewer/Editor/Owner）。
4. 加入 README 版本化与变更日志。
5. 支持数据集文件预览、行级采样、统计分析。
6. 对接模型推理服务，展示部署状态与调用地址。

---

## 第二步：项目目录结构

```text
.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── datasets/
│   │   ├── files/
│   │   ├── models/
│   │   ├── search/
│   │   └── tags/
│   ├── datasets/
│   ├── login/
│   ├── models/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/uploads/
├── .env.example
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

### 目录说明

- `app/api/auth`：登录与当前用户接口。
- `app/api/models`：模型 CRUD、版本、文件接口。
- `app/api/datasets`：数据集 CRUD、版本、文件接口。
- `app/api/files/[id]/download`：统一下载接口。
- `app/models`：模型列表、详情、新建、编辑页。
- `app/datasets`：数据集列表、详情、新建、编辑页。
- `components`：表单、Markdown 展示、列表卡片、上传与版本组件。
- `lib/auth.ts`：JWT 鉴权与权限判断。
- `lib/storage.ts`：本地文件存储抽象。
- `lib/queries.ts`：列表检索逻辑。
- `prisma/schema.prisma`：数据库结构定义。
- `prisma/seed.ts`：默认账号与示例资源初始化。

---

## 第三步：数据库 Schema

完整 Prisma Schema 见：`prisma/schema.prisma`。

### 主要实体关系

- `User 1:N Model`
- `User 1:N Dataset`
- `Model 1:N ResourceVersion`
- `Dataset 1:N ResourceVersion`
- `Model 1:N ResourceFile`
- `Dataset 1:N ResourceFile`
- `Tag 1:N ResourceTag`
- `User 1:N ResourcePermission`

### 表结构摘要

#### users
- `id`
- `email`
- `name`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

#### models
- `id`
- `slug`
- `name`
- `summary`
- `readme`
- `modelType`
- `baseModel`
- `taskType`
- `tags[]`
- `ownerId`
- `ownerName`
- `visibility`
- `currentVersionId`
- `createdAt`
- `updatedAt`

#### datasets
- `id`
- `slug`
- `name`
- `summary`
- `readme`
- `datasetType`
- `taskType`
- `tags[]`
- `source`
- `recordCount`
- `fileCount`
- `sizeBytes`
- `format`
- `ownerId`
- `ownerName`
- `visibility`
- `currentVersionId`
- `sampleData`
- `createdAt`
- `updatedAt`

#### resource_versions
- `id`
- `resourceType`
- `modelId` / `datasetId`
- `version`
- `description`
- `createdById`
- `createdAt`
- `fileIds[]`

#### resource_files
- `id`
- `resourceType`
- `modelId` / `datasetId`
- `versionId`
- `name`
- `storagePath`
- `mimeType`
- `sizeBytes`
- `uploadedById`
- `uploadedAt`
- `sourceType`
- `externalUrl`

#### tags / resource_tags / permissions
- 用于标签管理与显式授权扩展。

---

## 第四步：后端代码说明

### 已实现模块

1. **鉴权模块**
   - `POST /api/auth/login`
   - `GET /api/auth/me`
   - JWT + Cookie

2. **模型管理模块**
   - `GET /api/models`
   - `POST /api/models`
   - `GET /api/models/:id`
   - `PUT /api/models/:id`
   - `DELETE /api/models/:id`

3. **数据集管理模块**
   - `GET /api/datasets`
   - `POST /api/datasets`
   - `GET /api/datasets/:id`
   - `PUT /api/datasets/:id`
   - `DELETE /api/datasets/:id`

4. **文件上传模块**
   - `POST /api/models/:id/files`
   - `GET /api/models/:id/files`
   - `POST /api/datasets/:id/files`
   - `GET /api/datasets/:id/files`
   - `GET /api/files/:id/download`

5. **版本管理模块**
   - `GET /api/models/:id/versions`
   - `POST /api/models/:id/versions`
   - `GET /api/datasets/:id/versions`
   - `POST /api/datasets/:id/versions`

6. **搜索与标签模块**
   - `GET /api/search`
   - `GET /api/tags`

---

## 第五步：前端页面说明

### 已生成页面

- `/login`：登录页
- `/`：首页 / 资源总览页
- `/models`：模型列表页
- `/models/[id]`：模型详情页
- `/models/new`：创建模型页
- `/models/[id]/edit`：编辑模型页
- `/datasets`：数据集列表页
- `/datasets/[id]`：数据集详情页
- `/datasets/new`：创建数据集页
- `/datasets/[id]/edit`：编辑数据集页

### 页面风格

- 采用简洁管理后台样式。
- 保留 Hugging Face repo 页的核心结构：
  - 资源头部信息
  - README 区域
  - 版本历史
  - 文件列表
  - 元数据展示

---

## 第六步：接口设计清单

### 1. Auth

#### `POST /api/auth/login`
**请求体**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**响应示例**
```json
{
  "id": "usr_xxx",
  "email": "admin@example.com",
  "name": "System Admin",
  "role": "ADMIN"
}
```

#### `GET /api/auth/me`
**响应示例**
```json
{
  "user": {
    "id": "usr_xxx",
    "email": "admin@example.com",
    "name": "System Admin",
    "role": "ADMIN"
  }
}
```

### 2. Models

#### `GET /api/models?q=&tag=&taskType=&visibility=&ownerId=`
返回模型列表。

#### `POST /api/models`
**请求体**
```json
{
  "name": "Enterprise Chat 7B",
  "summary": "企业聊天模型",
  "readme": "# README",
  "modelType": "LLM",
  "baseModel": "Llama 3.1 8B",
  "taskType": "chat",
  "tags": "chat,finance",
  "ownerName": "Alice",
  "visibility": "INTERNAL"
}
```

#### `GET /api/models/:id`
返回模型详情、版本与文件信息。

#### `PUT /api/models/:id`
更新模型元数据。

#### `DELETE /api/models/:id`
删除模型与关联版本/文件/标签关系。

### 3. Model Versions

#### `GET /api/models/:id/versions`
返回模型版本列表。

#### `POST /api/models/:id/versions`
**请求体**
```json
{
  "version": "v2",
  "description": "修复 tokenizer 并新增系统提示词",
  "fileIds": [],
  "setAsCurrent": true
}
```

### 4. Model Files

#### `GET /api/models/:id/files`
返回模型文件列表。

#### `POST /api/models/:id/files`
- `multipart/form-data`
- 字段：`file`

#### `GET /api/files/:fileId/download`
下载文件流。

### 5. Datasets

#### `GET /api/datasets?q=&tag=&taskType=&visibility=&ownerId=`
返回数据集列表。

#### `POST /api/datasets`
**请求体**
```json
{
  "name": "Customer Support SFT",
  "summary": "客服场景 SFT 数据集",
  "readme": "# README",
  "datasetType": "sft",
  "taskType": "chat",
  "tags": "chat,sft",
  "source": "内部工单系统",
  "recordCount": 12000,
  "fileCount": 2,
  "sizeBytes": 26214400,
  "format": "jsonl",
  "ownerName": "Bob",
  "visibility": "INTERNAL",
  "sampleData": [
    {
      "instruction": "用户咨询退款进度",
      "output": "请先核对订单号"
    }
  ]
}
```

#### `GET /api/datasets/:id`
返回数据集详情。

#### `PUT /api/datasets/:id`
更新数据集。

#### `DELETE /api/datasets/:id`
删除数据集及关联信息。

### 6. Dataset Versions

#### `GET /api/datasets/:id/versions`
返回数据集版本列表。

#### `POST /api/datasets/:id/versions`
**请求体**
```json
{
  "version": "v2",
  "description": "新增清洗后的偏好数据",
  "fileIds": [],
  "setAsCurrent": true
}
```

### 7. Dataset Files

#### `GET /api/datasets/:id/files`
返回文件列表。

#### `POST /api/datasets/:id/files`
- `multipart/form-data`
- 字段：`file`

### 8. Tags & Search

#### `GET /api/tags`
返回标签列表。

#### `GET /api/search?type=model|dataset&q=&tag=&taskType=&visibility=&ownerId=`
统一搜索接口。

---

## 启动说明

### 1. 环境变量说明

复制并编辑环境变量：

```bash
cp .env.example .env
```

关键变量：
- `DATABASE_URL`：PostgreSQL 连接串
- `JWT_SECRET`：JWT 签名密钥
- `UPLOAD_DIR`：本地文件上传目录
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`：默认管理员账号
- `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`：默认普通用户账号

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
npx prisma generate
npm run db:push
npm run db:seed
```

### 4. 启动开发环境

```bash
npm run dev
```

访问：`http://localhost:3000`

### 5. 默认账号

- 管理员：`admin@example.com / Admin123!`
- 普通用户：`user@example.com / User123!`

### 6. 本地开发建议

- 修改数据库结构后执行：
  ```bash
  npm run db:push
  ```
- 若需要重置数据，可先清空数据库再运行 seed。
- 文件默认落在 `public/uploads`，后续可以替换 `lib/storage.ts` 为 MinIO 实现。

---

## 后续开发路线图（建议）

### Phase 2
- 增加组织空间、团队隔离与共享权限。
- 文件支持登记外部对象存储路径，不必必须上传。
- 增加 README 模板、模型卡/数据集卡规范字段。

### Phase 3
- 接入评测结果、训练任务、部署状态。
- 增加操作审计日志。
- 增加高级筛选、全文检索、收藏功能。

### Phase 4
- 支持模型在线推理调试。
- 支持数据集预处理任务与可视化分析。
- 对接 SSO、LDAP、企业审批流。

---

## 说明

本项目刻意遵循“**先做可运行 MVP，再逐步扩展**”原则：
- 不追求一次性覆盖 Hugging Face 全部能力。
- 优先跑通企业内部真正高频的资源管理流程。
- 所有命名与字段在前后端中已保持一致，便于继续扩展。
