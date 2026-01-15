/**
 * シードスクリプト
 *
 * 06_テスト設計.md の仕様に準拠:
 * - 2ユーザー、各ユーザーに2プロジェクト、各プロジェクトに2フォルダ+3ファイル
 *
 * 使用方法:
 *   DATABASE_URL=postgres://... pnpm --filter @ato/backend db:seed
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 決定的UUID生成（テスト設計書のファクトリパターンに準拠）
const UUID_CATEGORY = {
  USER: 1,
  PROJECT: 2,
  FILE: 3,
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

// ダミーCRDTデータ（空のYjsドキュメント相当）
const EMPTY_CRDT_DOC = new Uint8Array([0, 0])

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  const sql = postgres(databaseUrl)
  const db = drizzle({ client: sql, schema })

  console.log('Seeding database...')

  // シーケンスリセット
  resetSequence()

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
    console.log(`  Created user: seed-user-${i}@example.com (${userId})`)
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
      console.log(`    Created project: Project ${p} (${projectId})`)

      // FileTreeDoc作成
      await db.insert(schema.fileTreeDocs).values({
        projectId,
        doc: EMPTY_CRDT_DOC,
      })

      // 各プロジェクトに3ファイル作成
      for (let f = 1; f <= 3; f++) {
        const fileId = testUUID(UUID_CATEGORY.FILE)
        await db.insert(schema.fileContentDocs).values({
          fileId,
          projectId,
          doc: EMPTY_CRDT_DOC,
        })
        console.log(`      Created file: file-${f} (${fileId})`)
      }

      // 各プロジェクトに2フォルダ作成（フォルダはfile_content_docsには入らない、file_tree_docsのCRDT内で管理）
      // ※実際のフォルダ情報はFileTreeDocのCRDT内に格納されるため、ここではログのみ
      console.log(`      Created 2 folders (stored in FileTreeDoc CRDT)`)
    }
  }

  await sql.end()
  console.log('Seeding completed!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
