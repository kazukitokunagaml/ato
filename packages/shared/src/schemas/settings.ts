import { z } from 'zod'

// フォントタイプ
export const fontSchema = z.enum(['bizud-gothic', 'shippori-mincho'])

// ユーザー設定スキーマ
export const settingsSchema = z.object({
  font: fontSchema,
  fontSize: z.number().int().min(16, 'フォントサイズは16以上で入力してください'),
  lineWrap: z.boolean(),
})

// デフォルト設定
export const defaultSettings: z.infer<typeof settingsSchema> = {
  font: 'bizud-gothic',
  fontSize: 16,
  lineWrap: true,
}
