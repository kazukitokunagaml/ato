import { describe, it, expect } from 'vitest'
import { nameSchema, uuidSchema } from './common'

describe('nameSchema', () => {
  it('accepts valid names', () => {
    expect(nameSchema.safeParse('My Project').success).toBe(true)
    expect(nameSchema.safeParse('test-file.md').success).toBe(true)
  })

  it('rejects empty strings', () => {
    expect(nameSchema.safeParse('').success).toBe(false)
  })

  it('rejects names with forbidden characters', () => {
    expect(nameSchema.safeParse('file/name').success).toBe(false)
    expect(nameSchema.safeParse('file\\name').success).toBe(false)
    expect(nameSchema.safeParse('file:name').success).toBe(false)
    expect(nameSchema.safeParse('file*name').success).toBe(false)
    expect(nameSchema.safeParse('file?name').success).toBe(false)
    expect(nameSchema.safeParse('file"name').success).toBe(false)
    expect(nameSchema.safeParse('file<name').success).toBe(false)
    expect(nameSchema.safeParse('file>name').success).toBe(false)
    expect(nameSchema.safeParse('file|name').success).toBe(false)
  })
})

describe('uuidSchema', () => {
  it('accepts valid UUIDs', () => {
    expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true)
  })

  it('rejects invalid UUIDs', () => {
    expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false)
    expect(uuidSchema.safeParse('').success).toBe(false)
  })
})
