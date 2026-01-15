import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetSequence,
  userFactory,
  projectFactory,
  fileTreeItemFactory,
  TEST_TIMESTAMP_ISO,
} from './factories'

describe('factories', () => {
  beforeEach(() => {
    resetSequence()
  })

  describe('userFactory', () => {
    it('generates deterministic user data', () => {
      const user1 = userFactory.build()
      resetSequence()
      const user2 = userFactory.build()

      expect(user1.id).toBe(user2.id)
      expect(user1.googleId).toBe(user2.googleId)
      expect(user1.email).toBe(user2.email)
    })

    it('generates unique users in sequence', () => {
      const user1 = userFactory.build()
      const user2 = userFactory.build()

      expect(user1.id).not.toBe(user2.id)
      expect(user1.email).not.toBe(user2.email)
    })

    it('allows overrides', () => {
      const user = userFactory.build({ name: 'Custom Name' })
      expect(user.name).toBe('Custom Name')
    })

    it('uses fixed timestamp', () => {
      const user = userFactory.build()
      expect(user.createdAt).toBe(TEST_TIMESTAMP_ISO)
      expect(user.updatedAt).toBe(TEST_TIMESTAMP_ISO)
    })
  })

  describe('projectFactory', () => {
    it('generates project with owner', () => {
      const user = userFactory.build()
      const project = projectFactory.build(user.id)

      expect(project.ownerId).toBe(user.id)
      expect(project.name).toMatch(/^Test Project \d+$/)
    })
  })

  describe('fileTreeItemFactory', () => {
    it('generates file with correct type', () => {
      const file = fileTreeItemFactory.buildFile(null)
      expect(file.type).toBe('file')
      expect(file.name).toMatch(/\.md$/)
    })

    it('generates folder with correct type', () => {
      const folder = fileTreeItemFactory.buildFolder(null)
      expect(folder.type).toBe('folder')
      expect(folder.name).not.toMatch(/\.md$/)
    })

    it('sets parentId correctly', () => {
      const folder = fileTreeItemFactory.buildFolder(null)
      const file = fileTreeItemFactory.buildFile(folder.id)

      expect(folder.parentId).toBeNull()
      expect(file.parentId).toBe(folder.id)
    })
  })
})
