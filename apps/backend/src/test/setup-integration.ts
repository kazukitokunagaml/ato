import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

let container: StartedPostgreSqlContainer | null = null

// プロセス終了時にコンテナを確実に停止
process.on('SIGINT', async () => {
  await cleanupContainer()
  process.exit(0)
})
process.on('SIGTERM', async () => {
  await cleanupContainer()
  process.exit(0)
})
process.on('uncaughtException', async (err) => {
  console.error('Uncaught exception:', err)
  await cleanupContainer()
  process.exit(1)
})

async function cleanupContainer(): Promise<void> {
  if (container) {
    console.log('Cleaning up PostgreSQL container...')
    try {
      await container.stop({ remove: true, removeVolumes: true })
    } catch {
      // コンテナが既に停止している場合は無視
    }
    container = null
  }
}

export async function setup(): Promise<void> {
  console.log('Starting PostgreSQL container...')
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('ato_test')
    .withUsername('test')
    .withPassword('test')
    .start()

  // 環境変数にDATABASE_URLを設定
  const connectionUri = container.getConnectionUri()
  process.env.DATABASE_URL = connectionUri
  console.log(`PostgreSQL container started: ${connectionUri}`)

  // マイグレーション実行
  console.log('Running migrations...')
  const sql = postgres(connectionUri, { max: 1 })
  const db = drizzle({ client: sql })
  await migrate(db, { migrationsFolder: './drizzle' })
  await sql.end()
  console.log('Migrations completed')
}

export async function teardown(): Promise<void> {
  await cleanupContainer()
}
