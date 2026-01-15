import type { UserEntity, ProjectEntity, FileTreeItem } from '../types/entities'

// シーケンス管理（テストごとにリセット）
let sequence = 0
export const resetSequence = (): void => {
  sequence = 0
}
const nextSequence = (): number => ++sequence

// 決定的なUUID v4生成（テスト用）
const testUUID = (category: number): string => {
  const seq = nextSequence()
  const hex = (n: number, len: number): string => n.toString(16).padStart(len, '0')
  return `${hex(category, 8)}-${hex(seq & 0xffff, 4)}-4000-8000-${hex(seq & 0xffffffffffff, 12)}`
}

// 固定タイムスタンプ（テスト用）
export const TEST_TIMESTAMP = new Date('2024-01-15T00:00:00.000Z')
export const TEST_TIMESTAMP_ISO = TEST_TIMESTAMP.toISOString()

// カテゴリ定数
const UUID_CATEGORY = {
  USER: 1,
  PROJECT: 2,
  FILE: 3,
} as const

// ユーザーファクトリ（DBエンティティ用）
export const userFactory = {
  build: (overrides?: Partial<UserEntity>): UserEntity => {
    const seq = nextSequence()
    return {
      id: testUUID(UUID_CATEGORY.USER),
      googleId: `google-${seq}`,
      email: `test-user-${seq}@example.com`,
      name: `Test User ${seq}`,
      createdAt: TEST_TIMESTAMP_ISO,
      updatedAt: TEST_TIMESTAMP_ISO,
      ...overrides,
    }
  },
}

// プロジェクトファクトリ（DBエンティティ用）
export const projectFactory = {
  build: (ownerId: string, overrides?: Partial<ProjectEntity>): ProjectEntity => {
    const seq = nextSequence()
    return {
      id: testUUID(UUID_CATEGORY.PROJECT),
      ownerId,
      name: `Test Project ${seq}`,
      createdAt: TEST_TIMESTAMP_ISO,
      updatedAt: TEST_TIMESTAMP_ISO,
      ...overrides,
    }
  },
}

// ファイルツリーアイテムファクトリ
export const fileTreeItemFactory = {
  buildFile: (parentId: string | null, overrides?: Partial<FileTreeItem>): FileTreeItem => {
    const seq = nextSequence()
    return {
      id: testUUID(UUID_CATEGORY.FILE),
      name: `test-file-${seq}.md`,
      type: 'file',
      parentId,
      createdAt: TEST_TIMESTAMP_ISO,
      updatedAt: TEST_TIMESTAMP_ISO,
      ...overrides,
    }
  },
  buildFolder: (parentId: string | null, overrides?: Partial<FileTreeItem>): FileTreeItem => {
    const seq = nextSequence()
    return {
      id: testUUID(UUID_CATEGORY.FILE),
      name: `test-folder-${seq}`,
      type: 'folder',
      parentId,
      createdAt: TEST_TIMESTAMP_ISO,
      updatedAt: TEST_TIMESTAMP_ISO,
      ...overrides,
    }
  },
}
