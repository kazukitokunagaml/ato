import { z } from 'zod'
import { uuidSchema, datetimeSchema, base64Schema, createDataResponseSchema } from './common'

// 更新対象タイプ
export const targetTypeSchema = z.enum(['tree', 'content'])

// CRDT更新スキーマ
export const crdtUpdateSchema = z.object({
  targetType: targetTypeSchema,
  targetId: uuidSchema,
  update: base64Schema,
  createdAt: datetimeSchema,
})

// ファイルコンテンツのStateVector
export const contentStateVectorSchema = z.object({
  fileId: uuidSchema,
  stateVector: base64Schema,
})

// StateVectorsスキーマ
export const stateVectorsSchema = z.object({
  tree: base64Schema.optional(),
  contents: z.array(contentStateVectorSchema),
})

// POST /api/sync リクエスト
export const syncRequestSchema = z.object({
  projectId: uuidSchema,
  clientId: uuidSchema,
  updates: z.array(crdtUpdateSchema),
  stateVectors: stateVectorsSchema,
})

// ツリースナップショットスキーマ
export const treeSnapshotSchema = z.object({
  doc: base64Schema,
  updatedAt: datetimeSchema,
})

// コンテンツスナップショットスキーマ
export const contentSnapshotSchema = z.object({
  fileId: uuidSchema,
  doc: base64Schema,
  updatedAt: datetimeSchema,
})

// スナップショット群スキーマ
export const snapshotsSchema = z.object({
  tree: treeSnapshotSchema.optional(),
  contents: z.array(contentSnapshotSchema),
})

// POST /api/sync レスポンス
export const syncResponseSchema = createDataResponseSchema(
  z.object({
    updates: z.array(crdtUpdateSchema),
    snapshots: snapshotsSchema,
    serverTime: datetimeSchema,
  })
)
