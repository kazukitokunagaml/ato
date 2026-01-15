/**
 * レート制限ミドルウェアの単体テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  recordLoginFailure,
  resetLoginFailures,
  isAccountLocked,
  getConfigForPath,
  checkRateLimit,
  clearRateLimitStore,
} from './rate-limit'

describe('レート制限', () => {
  describe('getConfigForPath', () => {
    it('/api/auth/login は 5回/分', () => {
      const config = getConfigForPath('/api/auth/login')
      expect(config.maxRequests).toBe(5)
      expect(config.windowMs).toBe(60000)
      expect(config.keyType).toBe('ip')
    })

    it('/api/auth/dev-login は 5回/分', () => {
      const config = getConfigForPath('/api/auth/dev-login')
      expect(config.maxRequests).toBe(5)
      expect(config.windowMs).toBe(60000)
      expect(config.keyType).toBe('ip')
    })

    it('/api/auth/refresh は 10回/分', () => {
      const config = getConfigForPath('/api/auth/refresh')
      expect(config.maxRequests).toBe(10)
      expect(config.windowMs).toBe(60000)
      expect(config.keyType).toBe('user')
    })

    it('/api/sync/* は 60回/分（プレフィックスマッチ）', () => {
      const config1 = getConfigForPath('/api/sync')
      expect(config1.maxRequests).toBe(60)
      expect(config1.keyType).toBe('user')

      const config2 = getConfigForPath('/api/sync/push')
      expect(config2.maxRequests).toBe(60)

      const config3 = getConfigForPath('/api/sync/pull')
      expect(config3.maxRequests).toBe(60)
    })

    it('その他のAPIはデフォルト 100回/分', () => {
      const config = getConfigForPath('/api/projects')
      expect(config.maxRequests).toBe(100)
      expect(config.windowMs).toBe(60000)
      expect(config.keyType).toBe('user')
    })
  })

  describe('checkRateLimit', () => {
    beforeEach(() => {
      clearRateLimitStore()
    })

    it('制限内のリクエストは許可される', () => {
      const config = { windowMs: 60000, maxRequests: 5, keyType: 'ip' as const }

      const result = checkRateLimit('test-key', config)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('制限を超えたリクエストは拒否される', () => {
      const config = { windowMs: 60000, maxRequests: 3, keyType: 'ip' as const }

      // 3回までは許可
      checkRateLimit('test-key', config)
      checkRateLimit('test-key', config)
      const result3 = checkRateLimit('test-key', config)
      expect(result3.allowed).toBe(true)
      expect(result3.remaining).toBe(0)

      // 4回目は拒否
      const result4 = checkRateLimit('test-key', config)
      expect(result4.allowed).toBe(false)
      expect(result4.remaining).toBe(0)
    })

    it('ウィンドウリセット後は再び許可される', () => {
      vi.useFakeTimers()
      const config = { windowMs: 60000, maxRequests: 2, keyType: 'ip' as const }

      // 2回リクエスト
      checkRateLimit('test-key', config)
      checkRateLimit('test-key', config)

      // 3回目は拒否
      const result3 = checkRateLimit('test-key', config)
      expect(result3.allowed).toBe(false)

      // 60秒後（ウィンドウリセット）
      vi.advanceTimersByTime(61000)

      // 再び許可される
      const result4 = checkRateLimit('test-key', config)
      expect(result4.allowed).toBe(true)
      expect(result4.remaining).toBe(1)

      vi.useRealTimers()
    })

    it('異なるキーは独立してカウントされる', () => {
      const config = { windowMs: 60000, maxRequests: 2, keyType: 'ip' as const }

      checkRateLimit('key-1', config)
      checkRateLimit('key-1', config)
      const result1 = checkRateLimit('key-1', config)
      expect(result1.allowed).toBe(false)

      // 別のキーはまだ許可される
      const result2 = checkRateLimit('key-2', config)
      expect(result2.allowed).toBe(true)
    })

    it('resetAt はウィンドウ終了時刻を返す', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))

      const config = { windowMs: 60000, maxRequests: 5, keyType: 'ip' as const }
      const result = checkRateLimit('test-key', config)

      // 60秒後
      expect(result.resetAt).toBe(new Date('2024-01-01T00:01:00Z').getTime())

      vi.useRealTimers()
    })
  })

  describe('アカウントロック機能', () => {
    beforeEach(() => {
      // テスト間でストアをクリア
      resetLoginFailures('test-user')
      resetLoginFailures('test-user-2')
    })

    describe('recordLoginFailure', () => {
      it('失敗をカウントする', () => {
        const result1 = recordLoginFailure('test-user')
        expect(result1.failCount).toBe(1)
        expect(result1.isLocked).toBe(false)

        const result2 = recordLoginFailure('test-user')
        expect(result2.failCount).toBe(2)
        expect(result2.isLocked).toBe(false)
      })

      it('10回失敗でアカウントをロックする', () => {
        // 9回失敗
        for (let i = 1; i <= 9; i++) {
          const result = recordLoginFailure('test-user')
          expect(result.failCount).toBe(i)
          expect(result.isLocked).toBe(false)
        }

        // 10回目でロック
        const result = recordLoginFailure('test-user')
        expect(result.failCount).toBe(10)
        expect(result.isLocked).toBe(true)
        expect(result.lockedUntil).toBeDefined()
        expect(result.lockedUntil).toBeGreaterThan(Date.now())
      })

      it('ロック中は追加の失敗を記録してもロック状態を維持する', () => {
        // 10回失敗してロック
        for (let i = 0; i < 10; i++) {
          recordLoginFailure('test-user')
        }

        // ロック中に追加の失敗
        const result = recordLoginFailure('test-user')
        expect(result.isLocked).toBe(true)
      })

      it('異なるユーザーは独立してカウントされる', () => {
        recordLoginFailure('test-user')
        recordLoginFailure('test-user')
        recordLoginFailure('test-user')

        const result = recordLoginFailure('test-user-2')
        expect(result.failCount).toBe(1)
      })
    })

    describe('isAccountLocked', () => {
      it('ロックされていないアカウントはfalseを返す', () => {
        expect(isAccountLocked('test-user')).toBe(false)
      })

      it('存在しないアカウントはfalseを返す', () => {
        expect(isAccountLocked('non-existent-user')).toBe(false)
      })

      it('ロックされたアカウントはtrueを返す', () => {
        // 10回失敗してロック
        for (let i = 0; i < 10; i++) {
          recordLoginFailure('test-user')
        }

        expect(isAccountLocked('test-user')).toBe(true)
      })
    })

    describe('resetLoginFailures', () => {
      it('ログイン成功でカウントをリセットする', () => {
        // いくつか失敗を記録
        recordLoginFailure('test-user')
        recordLoginFailure('test-user')
        recordLoginFailure('test-user')

        // リセット
        resetLoginFailures('test-user')

        // 次の失敗は1からカウント
        const result = recordLoginFailure('test-user')
        expect(result.failCount).toBe(1)
      })

      it('ロック状態もリセットする', () => {
        // 10回失敗してロック
        for (let i = 0; i < 10; i++) {
          recordLoginFailure('test-user')
        }
        expect(isAccountLocked('test-user')).toBe(true)

        // リセット
        resetLoginFailures('test-user')

        // ロック解除
        expect(isAccountLocked('test-user')).toBe(false)
      })
    })

    describe('30分後のロック解除', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('30分後にロックが解除される', () => {
        // 10回失敗してロック
        for (let i = 0; i < 10; i++) {
          recordLoginFailure('test-user')
        }
        expect(isAccountLocked('test-user')).toBe(true)

        // 29分後はまだロック中
        vi.advanceTimersByTime(29 * 60 * 1000)
        expect(isAccountLocked('test-user')).toBe(true)

        // 30分後にロック解除
        vi.advanceTimersByTime(2 * 60 * 1000) // 追加で2分（計31分）
        expect(isAccountLocked('test-user')).toBe(false)
      })

      it('ロック解除後は再びカウントが1から始まる', () => {
        // 10回失敗してロック
        for (let i = 0; i < 10; i++) {
          recordLoginFailure('test-user')
        }

        // 31分後（ロック解除）
        vi.advanceTimersByTime(31 * 60 * 1000)

        // 次の失敗は1からカウント
        const result = recordLoginFailure('test-user')
        expect(result.failCount).toBe(1)
        expect(result.isLocked).toBe(false)
      })
    })
  })
})
