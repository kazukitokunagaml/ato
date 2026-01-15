import { describe, it, expect, beforeEach } from 'vitest'
import app from '../index'
import { getTestDb, clearTables } from './helpers'

describe('Health endpoint (integration)', () => {
  it('GET /health returns 200', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ status: 'ok' })
  })
})

describe('Database operations (integration)', () => {
  beforeEach(async () => {
    const db = getTestDb()
    await clearTables(db)
  })

  it('can insert and query users', async () => {
    const db = getTestDb()
    const { users } = await import('../db/schema')

    // ユーザー挿入
    const insertedUsers = await db.insert(users).values({
      id: '00000001-0001-4000-8000-000000000001',
      googleId: 'google-test-1',
      email: 'test@example.com',
      name: 'Test User',
    }).returning()
    const user = insertedUsers[0]

    expect(user).toBeDefined()
    expect(user!.email).toBe('test@example.com')

    // クエリ
    const allUsers = await db.select().from(users)
    expect(allUsers).toHaveLength(1)
    expect(allUsers[0]!.name).toBe('Test User')
  })
})
