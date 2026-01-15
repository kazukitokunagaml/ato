import { describe, it, expect, beforeEach } from 'vitest'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// シードスクリプトと同じロジックをテスト（衝突を避けるため別のカテゴリ番号を使用）
const UUID_CATEGORY = {
  USER: 0x10,     // 認証テストの USER: 1 と衝突しないように
  PROJECT: 0x20,  // 認証テストの PROJECT: 2 と衝突しないように
  FILE: 0x30,
} as const

let sequence = 0
const resetSequence = () => {
  sequence = 0
}
const nextSequence = () => ++sequence

const testUUID = (category: number) => {
  const seq = nextSequence()
  const hex = (n: number, len: number) => n.toString(16).padStart(len, '0')
  return `${hex(category, 8)}-${hex(seq & 0xffff, 4)}-4000-8000-${hex(seq & 0xffffffffffff, 12)}`
}

const EMPTY_CRDT_DOC = new Uint8Array([0, 0])

describe('Seed script (integration)', () => {
  let db: ReturnType<typeof drizzle<typeof schema>>

  beforeEach(async () => {
    const sql = postgres(process.env.DATABASE_URL!)
    db = drizzle({ client: sql, schema })

    // クリア
    await db.delete(schema.fileContentDocs)
    await db.delete(schema.fileTreeDocs)
    await db.delete(schema.projects)
    await db.delete(schema.users)

    resetSequence()
  })

  it('creates 2 users with 2 projects each', async () => {
    // ユーザー作成（2人）
    const userIds: string[] = []
    for (let i = 1; i <= 2; i++) {
      const userId = testUUID(UUID_CATEGORY.USER)
      userIds.push(userId)

      await db.insert(schema.users).values({
        id: userId,
        googleId: `google-seed-${i}`,
        email: `seed-user-${i}@example.com`,
        name: `Seed User ${i}`,
      })
    }

    // 各ユーザーに2プロジェクト作成
    for (const userId of userIds) {
      for (let p = 1; p <= 2; p++) {
        const projectId = testUUID(UUID_CATEGORY.PROJECT)

        await db.insert(schema.projects).values({
          id: projectId,
          ownerId: userId,
          name: `Project ${p}`,
        })

        await db.insert(schema.fileTreeDocs).values({
          projectId,
          doc: EMPTY_CRDT_DOC,
        })

        for (let f = 1; f <= 3; f++) {
          const fileId = testUUID(UUID_CATEGORY.FILE)
          await db.insert(schema.fileContentDocs).values({
            fileId,
            projectId,
            doc: EMPTY_CRDT_DOC,
          })
        }
      }
    }

    // 検証
    const users = await db.select().from(schema.users)
    expect(users).toHaveLength(2)

    const projects = await db.select().from(schema.projects)
    expect(projects).toHaveLength(4) // 2ユーザー × 2プロジェクト

    const fileTreeDocs = await db.select().from(schema.fileTreeDocs)
    expect(fileTreeDocs).toHaveLength(4) // 4プロジェクト

    const fileContentDocs = await db.select().from(schema.fileContentDocs)
    expect(fileContentDocs).toHaveLength(12) // 4プロジェクト × 3ファイル
  })
})
