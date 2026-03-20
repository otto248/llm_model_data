import { z } from 'zod';

const visibility = z.enum(['PRIVATE', 'INTERNAL', 'PUBLIC']);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const modelSchema = z.object({
  name: z.string().min(2),
  summary: z.string().min(5),
  readme: z.string().min(1),
  modelType: z.string().min(1),
  baseModel: z.string().optional().nullable(),
  taskType: z.string().min(1),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  ownerName: z.string().min(1),
  visibility,
  storagePath: z.string().optional().nullable(),
});

export const datasetSchema = z.object({
  name: z.string().min(2),
  summary: z.string().min(5),
  readme: z.string().min(1),
  datasetType: z.string().min(1),
  taskType: z.string().min(1),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  source: z.string().min(1),
  recordCount: z.coerce.number().int().nonnegative().default(0),
  fileCount: z.coerce.number().int().nonnegative().default(0),
  sizeBytes: z.coerce.number().int().nonnegative().default(0),
  format: z.string().min(1),
  ownerName: z.string().min(1),
  visibility,
  sampleData: z.any().optional(),
  storagePath: z.string().optional().nullable(),
});

export const versionSchema = z.object({
  version: z.string().regex(/^v\d+$/),
  description: z.string().min(1),
  fileIds: z.array(z.string()).optional().default([]),
  setAsCurrent: z.boolean().optional().default(false),
});
