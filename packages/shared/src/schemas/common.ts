import { z } from 'zod'

// 禁止文字: / \ : * ? " < > |
const FORBIDDEN_CHARS = /[/\\:*?"<>|]/

// 名前バリデーション（プロジェクト/ファイル/フォルダ共通）
export const nameSchema = z
  .string()
  .min(1, '名前は1文字以上で入力してください')
  .max(255, '名前は255文字以内で入力してください')
  .refine((val) => !FORBIDDEN_CHARS.test(val), {
    message: '名前に使用できない文字が含まれています: / \\ : * ? " < > |',
  })

// UUID v4スキーマ
export const uuidSchema = z.uuid('無効なUUID形式です')

// ISO 8601日時スキーマ
export const datetimeSchema = z.iso.datetime({ message: '無効な日時形式です' })

// Base64スキーマ（CRDT更新用）
export const base64Schema = z.base64('無効なBase64形式です')

// ページネーションスキーマ
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// 成功レスポンススキーマ（単一リソース）
export function createDataResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
  })
}

// 成功レスポンススキーマ（コレクション）
export function createListResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
  })
}

// エラーレスポンススキーマ
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z
      .object({
        field: z.string().optional(),
        reason: z.string().optional(),
      })
      .optional(),
  }),
})

// 同期エラーレスポンススキーマ（retryableフラグ付き）
export const syncErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean(),
  }),
})
