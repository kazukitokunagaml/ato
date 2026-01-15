/**
 * JWT発行・検証ユーティリティの単体テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  signAccessToken,
  signRefreshToken,
  signTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  getCookieOptions,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getDeleteCookieOptions,
} from './jwt'

// テスト用RSA鍵ペア（結合テストと同じ有効な鍵）
const TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVXdZlXnaxFqwi
zhJ1vQUPWW8Kd9neEdAEw3YM9sLE296D5gjS3A7YyKYLqF+a/Pu/wuZxvAT9em4c
CmaPJz08XL3lf7fR+MrdXgAApqhyu2RfjGufNA2BIZcYN/5MC3sRaEF3iNWutbOR
/MJ6yV3maOdX3qLVQCzDeNlMEFXwZPiKOBOOV50YbtCMmR+zNs6Q5WggKPUB4qfY
RVGQOZUzu/yWVvyh6YN+xgN3Nnie/a3Zd2K63iXV8DxgfQp8FynGxmvJfjjXLoC/
+gHOfY+l4m+2RREc64tyB+cf0nukHx40qqjD4CaNoLD3draz0mCEzn1+aMoEvzt9
MLebH54TAgMBAAECggEAAWkZjITrJ22SSMfcA8TTs4GBzqSZtM+qDVZDmwhV7lVk
BHUOxN/M7uSO/atkfIqCd1A7X3wwXeAJaML7LsOAZnDUkdv2NYm21lO8Oau/o0m8
WNMMjYkImzbg5IEodrmUoXInGbf7yjXid4pebQA4a0pQhcab9tovmG75Olv2VWbs
nANZYoG/jRqlfoc5W2hdl2zcHiX42U7Q2mWlWmp1INgkgpCKiMC2690IDb3TDI5U
KkwoqTkh+xLDUig/zU3U6uOatgggRXFDFvYNw0fVBeg6ig+lIBa3wrCnKyDHG48P
YTaQKTMzdWXUHDxbPXerkgPRjuzppQISCNSUaPQKQQKBgQDFR0Ho+XI/JcFuOzIU
Lri7Lzs1tyGVaqpWjlq8cHXls2MUe+cvOP3cfpv8Z4h5911YvP+0bkQZZuIwTJQK
WmXPtQlqpzneY9rFg3UbL4jrvPPvFFvLyVSg9oPMt9zadmnZVlH41QCuQ5svBJze
ERfWui/47BTHlAM2K2y2BhCuQQKBgQDB06tB7dB0TdgH3bNd+9FCKuteSzWzsQES
XoQP/Xgts4a3FZN1WVj8wbl4SO+kkp9p6AIkcQEgFD5SLlADVgECaTansMp+nYuu
5oGKXZpiFYAVYW6CSFyyY9mzqp5g94jz2R3rja8XanS7NfTod9SKVdqhYkaJkShL
GYFPqc1fUwKBgGYzpFGt6SINzUfuIuOR0OIodeQ+G4fs2pI87YTyPiHh7VKPXhV4
0QuKDAWXHX0SSanPQCmZdm4yfrvG8GrsqhIRF+/I8pHj6VKp5+FNnwGBwl35jhTl
GJLLIzzLg/8pmWye65idwNyG6b5SBXKGKHN1waSTqbA7Xe6SUJ98ROgBAoGBAI/o
KhTPDp/rU+OzNQMofdtUpl/iE0MQviz3Q7HjjSDRU8oHGO5dofY3lw65iEN2ISmu
eji4Ng+tOAAoJnvzlNhHaa7jUdTj/9uhhLhIeuEr+WbmafgM5dYE0JPWr7Rq1KHH
p7FGBqOqBHUiwG0A2yrCR4revmRRA8uOajXNao/FAoGAI41h/Y0mQYkRFQ7dezTH
wnVVRqlw4ENY/+22XsrmDUmFVbDzRzAtoLy9JjVLGDMDEcndLKjlXR/5lVTm6Rxz
s9SoSyZhCqu1g4oMXHBGexEv2BndDFsXmqRYrgt6e47T0SbWpUUYlwPZ35/SRX11
RE5WSsFP2jRc6Pjmw0K8bV4=
-----END PRIVATE KEY-----`

const TEST_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlV3WZV52sRasIs4Sdb0F
D1lvCnfZ3hHQBMN2DPbCxNveg+YI0twO2MimC6hfmvz7v8LmcbwE/XpuHApmjyc9
PFy95X+30fjK3V4AAKaocrtkX4xrnzQNgSGXGDf+TAt7EWhBd4jVrrWzkfzCesld
5mjnV96i1UAsw3jZTBBV8GT4ijgTjledGG7QjJkfszbOkOVoICj1AeKn2EVRkDmV
M7v8llb8oemDfsYDdzZ4nv2t2Xdiut4l1fA8YH0KfBcpxsZryX441y6Av/oBzn2P
peJvtkURHOuLcgfnH9J7pB8eNKqow+AmjaCw93a2s9JghM59fmjKBL87fTC3mx+e
EwIDAQAB
-----END PUBLIC KEY-----`

// 無効な鍵（エラーテスト用）
const INVALID_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ninvalid\n-----END PRIVATE KEY-----'

// 別の鍵ペア（署名不一致テスト用）
const OTHER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3nONeYerALtxhRfZx0t6
MqtyLm/oqlRqTV4G1y6sI1DlyttwO8ado4wyEZ4sFsld2nIpriEJQhgNsi+hvpqp
y07Mssg0D7R8awHv3QyaljoWD+s9g3hoYN5Wg5jdZowVQ/fW8lx4CIeONyt+e6j/
WAhSkWBXiXXzm3SVr5DribKIBycwB+OzpmwogK007MD7OqTriPbnw5n3bzT5RxdJ
0qqGYbQkx0Osgk4lpua1eFzvlGqOTeU/5mecPnofJ2oqMLTax68XQTcxjrrdazFf
QsELoYjU9uhylbKQdrKzbtN5mXsaaHF/ZRtDKPPBofa7wG/KObSawj+amLHbWSCD
EwIDAQAB
-----END PUBLIC KEY-----`

describe('JWT utility', () => {
  describe('signAccessToken', () => {
    it('有効なアクセストークンを発行できる', async () => {
      const token = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT形式: header.payload.signature
    })

    it('異なるユーザーには異なるトークンを発行する', async () => {
      const token1 = await signAccessToken('user-1', 'user1@example.com', TEST_PRIVATE_KEY)
      const token2 = await signAccessToken('user-2', 'user2@example.com', TEST_PRIVATE_KEY)

      expect(token1).not.toBe(token2)
    })

    it('同じユーザーでも毎回異なるjtiを持つトークンを発行する', async () => {
      const token1 = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)
      const token2 = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)

      // トークン自体は異なる（jtiが異なるため）
      expect(token1).not.toBe(token2)
    })

    it('無効な秘密鍵でエラーになる', async () => {
      await expect(
        signAccessToken('user-123', 'test@example.com', INVALID_PRIVATE_KEY)
      ).rejects.toThrow()
    })
  })

  describe('signRefreshToken', () => {
    it('有効なリフレッシュトークンを発行できる', async () => {
      const token = await signRefreshToken('user-123', TEST_PRIVATE_KEY)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('無効な秘密鍵でエラーになる', async () => {
      await expect(
        signRefreshToken('user-123', INVALID_PRIVATE_KEY)
      ).rejects.toThrow()
    })
  })

  describe('signTokenPair', () => {
    it('アクセストークンとリフレッシュトークンのペアを発行できる', async () => {
      const { accessToken, refreshToken } = await signTokenPair(
        'user-123',
        'test@example.com',
        TEST_PRIVATE_KEY
      )

      expect(accessToken).toBeDefined()
      expect(refreshToken).toBeDefined()
      expect(accessToken).not.toBe(refreshToken)
    })
  })

  describe('verifyAccessToken', () => {
    it('有効なアクセストークンを検証できる', async () => {
      const token = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)
      const payload = await verifyAccessToken(token, TEST_PUBLIC_KEY)

      expect(payload.sub).toBe('user-123')
      expect(payload.email).toBe('test@example.com')
      expect(payload.type).toBe('access')
      expect(payload.jti).toBeDefined()
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
    })

    it('リフレッシュトークンを渡すとエラーになる（type不一致）', async () => {
      const refreshToken = await signRefreshToken('user-123', TEST_PRIVATE_KEY)

      await expect(
        verifyAccessToken(refreshToken, TEST_PUBLIC_KEY)
      ).rejects.toThrow('Invalid token type: expected access token')
    })

    it('異なる公開鍵で検証するとエラーになる（署名不一致）', async () => {
      const token = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)

      await expect(
        verifyAccessToken(token, OTHER_PUBLIC_KEY)
      ).rejects.toThrow()
    })

    it('無効なトークン形式でエラーになる', async () => {
      await expect(
        verifyAccessToken('invalid-token', TEST_PUBLIC_KEY)
      ).rejects.toThrow()
    })

    it('改ざんされたトークンでエラーになる', async () => {
      const token = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)
      const [header, payload, signature] = token.split('.')
      const tamperedToken = `${header}.${payload}x.${signature}` // payloadを改ざん

      await expect(
        verifyAccessToken(tamperedToken, TEST_PUBLIC_KEY)
      ).rejects.toThrow()
    })
  })

  describe('verifyRefreshToken', () => {
    it('有効なリフレッシュトークンを検証できる', async () => {
      const token = await signRefreshToken('user-123', TEST_PRIVATE_KEY)
      const payload = await verifyRefreshToken(token, TEST_PUBLIC_KEY)

      expect(payload.sub).toBe('user-123')
      expect(payload.type).toBe('refresh')
      expect(payload.jti).toBeDefined()
    })

    it('アクセストークンを渡すとエラーになる（type不一致）', async () => {
      const accessToken = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)

      await expect(
        verifyRefreshToken(accessToken, TEST_PUBLIC_KEY)
      ).rejects.toThrow('Invalid token type: expected refresh token')
    })
  })

  describe('トークン有効期限', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('アクセストークンは1時間後に期限切れになる', async () => {
      const token = await signAccessToken('user-123', 'test@example.com', TEST_PRIVATE_KEY)

      // 発行直後は有効
      await expect(verifyAccessToken(token, TEST_PUBLIC_KEY)).resolves.toBeDefined()

      // 59分後はまだ有効
      vi.advanceTimersByTime(59 * 60 * 1000)
      await expect(verifyAccessToken(token, TEST_PUBLIC_KEY)).resolves.toBeDefined()

      // 1時間1秒後は期限切れ
      vi.advanceTimersByTime(2 * 60 * 1000) // 追加で2分進める（計61分）
      await expect(verifyAccessToken(token, TEST_PUBLIC_KEY)).rejects.toThrow()
    })

    it('リフレッシュトークンは7日後に期限切れになる', async () => {
      const token = await signRefreshToken('user-123', TEST_PRIVATE_KEY)

      // 発行直後は有効
      await expect(verifyRefreshToken(token, TEST_PUBLIC_KEY)).resolves.toBeDefined()

      // 6日後はまだ有効
      vi.advanceTimersByTime(6 * 24 * 60 * 60 * 1000)
      await expect(verifyRefreshToken(token, TEST_PUBLIC_KEY)).resolves.toBeDefined()

      // 7日1秒後は期限切れ
      vi.advanceTimersByTime(1 * 24 * 60 * 60 * 1000 + 1000) // 追加で1日+1秒
      await expect(verifyRefreshToken(token, TEST_PUBLIC_KEY)).rejects.toThrow()
    })
  })

  describe('Cookie設定', () => {
    describe('getCookieOptions', () => {
      it('本番環境ではSecure=trueを設定する', () => {
        const options = getCookieOptions(3600, true)

        expect(options.httpOnly).toBe(true)
        expect(options.secure).toBe(true)
        expect(options.sameSite).toBe('Strict')
        expect(options.path).toBe('/api')
        expect(options.maxAge).toBe(3600)
      })

      it('開発環境ではSecure=falseを設定する', () => {
        const options = getCookieOptions(3600, false)

        expect(options.httpOnly).toBe(true)
        expect(options.secure).toBe(false)
        expect(options.sameSite).toBe('Strict')
        expect(options.path).toBe('/api')
      })
    })

    describe('getAccessTokenCookieOptions', () => {
      it('アクセストークン用のCookie設定（maxAge=3600秒）を返す', () => {
        const options = getAccessTokenCookieOptions(true)

        expect(options.maxAge).toBe(60 * 60) // 1時間
        expect(options.httpOnly).toBe(true)
        expect(options.sameSite).toBe('Strict')
        expect(options.path).toBe('/api')
      })
    })

    describe('getRefreshTokenCookieOptions', () => {
      it('リフレッシュトークン用のCookie設定（maxAge=7日）を返す', () => {
        const options = getRefreshTokenCookieOptions(true)

        expect(options.maxAge).toBe(7 * 24 * 60 * 60) // 7日間
        expect(options.httpOnly).toBe(true)
        expect(options.sameSite).toBe('Strict')
        expect(options.path).toBe('/api')
      })
    })

    describe('getDeleteCookieOptions', () => {
      it('Cookie削除用の設定（maxAge=0）を返す', () => {
        const options = getDeleteCookieOptions(true)

        expect(options.maxAge).toBe(0)
        expect(options.httpOnly).toBe(true)
        expect(options.sameSite).toBe('Strict')
        expect(options.path).toBe('/api')
      })
    })
  })
})
