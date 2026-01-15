import { describe, it, expect } from 'vitest'
import {
  FILE_TREE_DOC_KEY,
  FILE_CONTENT_DOC_KEY,
  SETTINGS_KEY,
  CURRENT_PROJECT_ID_KEY,
  CURRENT_FILE_ID_KEY,
  STORAGE_PREFIX,
} from './keys'

describe('storage keys', () => {
  it('FILE_TREE_DOC_KEY generates correct key', () => {
    const key = FILE_TREE_DOC_KEY('project-123')
    expect(key).toBe('ato:file_tree_doc:project-123')
  })

  it('FILE_CONTENT_DOC_KEY generates correct key', () => {
    const key = FILE_CONTENT_DOC_KEY('file-456')
    expect(key).toBe('ato:file_content_doc:file-456')
  })

  it('SETTINGS_KEY is correct', () => {
    expect(SETTINGS_KEY).toBe('ato:settings')
  })

  it('CURRENT_PROJECT_ID_KEY is correct', () => {
    expect(CURRENT_PROJECT_ID_KEY).toBe('ato:current_project_id')
  })

  it('CURRENT_FILE_ID_KEY is correct', () => {
    expect(CURRENT_FILE_ID_KEY).toBe('ato:current_file_id')
  })

  it('all keys start with the same prefix', () => {
    expect(FILE_TREE_DOC_KEY('x').startsWith(STORAGE_PREFIX)).toBe(true)
    expect(FILE_CONTENT_DOC_KEY('x').startsWith(STORAGE_PREFIX)).toBe(true)
    expect(SETTINGS_KEY.startsWith(STORAGE_PREFIX)).toBe(true)
    expect(CURRENT_PROJECT_ID_KEY.startsWith(STORAGE_PREFIX)).toBe(true)
    expect(CURRENT_FILE_ID_KEY.startsWith(STORAGE_PREFIX)).toBe(true)
  })
})
