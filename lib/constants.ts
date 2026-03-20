export const AUTH_COOKIE = 'mini-hf-token';
export const DEFAULT_PAGE_SIZE = 12;

export const visibilityOptions = ['PRIVATE', 'INTERNAL', 'PUBLIC'] as const;
export const modelTypeOptions = ['LLM', 'Embedding', 'Reranker', 'Vision-Language'] as const;
export const datasetTypeOptions = ['instruction', 'pretrain', 'sft', 'preference', 'eval'] as const;
export const taskTypeOptions = ['chat', 'classification', 'generation', 'embedding', 'eval'] as const;
