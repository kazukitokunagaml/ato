import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 本番環境: @neondatabase/serverless（Cloudflare Workers対応）
// テスト環境: postgres-js（Testcontainers対応）
export function createDb(databaseUrl: string) {
  // Neon URLかどうかを判定（neon.techを含むかで判定）
  const isNeonUrl = databaseUrl.includes('neon.tech')

  if (isNeonUrl) {
    const sql = neon(databaseUrl)
    return drizzleNeon(sql, { schema })
  } else {
    // ローカルPostgreSQL/Testcontainers用
    const sql = postgres(databaseUrl)
    return drizzlePostgres({ client: sql, schema })
  }
}

export type Database = ReturnType<typeof createDb>
