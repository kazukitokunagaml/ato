import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

// テスト用DBクライアント取得
export function getTestDb() {
  const sql = postgres(process.env.DATABASE_URL!)
  return drizzle({ client: sql, schema })
}

// テスト用にテーブルをクリア
export async function clearTables(db: ReturnType<typeof getTestDb>) {
  // 外部キー制約の順序で削除
  await db.delete(schema.fileContentDocs)
  await db.delete(schema.fileTreeDocs)
  await db.delete(schema.projects)
  await db.delete(schema.users)
}
