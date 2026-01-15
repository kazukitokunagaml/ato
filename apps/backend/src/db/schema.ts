import { pgTable, uuid, text, timestamp, customType } from 'drizzle-orm/pg-core'

// Uint8Array用のカスタム型（BYTEA）
// Cloudflare Workers互換: Bufferの代わりにUint8Arrayを使用
const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType() {
    return 'bytea'
  },
  toDriver(value: Uint8Array): Uint8Array {
    return value
  },
  fromDriver(value: Uint8Array | Buffer): Uint8Array {
    // Node.js環境ではBuffer、Workers環境ではUint8Arrayが返される
    if (value instanceof Uint8Array) {
      return value
    }
    return new Uint8Array(value)
  },
})

// users テーブル
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// projects テーブル
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// file_tree_docs テーブル
export const fileTreeDocs = pgTable('file_tree_docs', {
  projectId: uuid('project_id')
    .primaryKey()
    .references(() => projects.id, { onDelete: 'cascade' }),
  doc: bytea('doc').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// file_content_docs テーブル
export const fileContentDocs = pgTable('file_content_docs', {
  fileId: uuid('file_id').primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  doc: bytea('doc').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// 型エクスポート
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type FileTreeDoc = typeof fileTreeDocs.$inferSelect
export type NewFileTreeDoc = typeof fileTreeDocs.$inferInsert
export type FileContentDoc = typeof fileContentDocs.$inferSelect
export type NewFileContentDoc = typeof fileContentDocs.$inferInsert
