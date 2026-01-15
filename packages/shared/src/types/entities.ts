import { z } from 'zod'
import {
  userResponseSchema,
  projectSchema,
  projectListItemSchema,
  settingsSchema,
  crdtUpdateSchema,
  targetTypeSchema,
} from '../schemas'

// ユーザー（APIレスポンス用: id, email のみ）
export type UserResponse = z.infer<typeof userResponseSchema>

// ユーザー（DBエンティティ用: テストファクトリ等で使用）
export type UserEntity = {
  id: string
  googleId: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

// プロジェクト（APIレスポンス用）
export type Project = z.infer<typeof projectSchema>

// プロジェクト（DBエンティティ用: テストファクトリ等で使用）
export type ProjectEntity = {
  id: string
  ownerId: string
  name: string
  createdAt: string
  updatedAt: string
}

// プロジェクト一覧アイテム
export type ProjectListItem = z.infer<typeof projectListItemSchema>

// ユーザー設定
export type Settings = z.infer<typeof settingsSchema>

// CRDT更新
export type CRDTUpdate = z.infer<typeof crdtUpdateSchema>

// 更新対象タイプ
export type TargetType = z.infer<typeof targetTypeSchema>

// ファイルツリーアイテム（クライアント側で使用）
export type FileTreeItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  createdAt: string
  updatedAt: string
}

// 同期状態
export type SyncState = 'synced' | 'syncing' | 'pending' | 'dialog_open' | 'force_fetch'
