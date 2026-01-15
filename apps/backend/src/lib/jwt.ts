/**
 * JWT発行・検証ユーティリティ
 *
 * セキュリティ設計書の仕様に準拠:
 * - アクセストークン: RS256, 有効期限1時間
 * - リフレッシュトークン: 有効期限7日間
 * - ペイロード: jti, sub, email, iat, exp, type
 */

import { SignJWT, jwtVerify, importPKCS8, importSPKI, type JWTPayload } from 'jose'

// トークンタイプ
export type TokenType = 'access' | 'refresh'

// JWTペイロード（アクセストークン）
export interface AccessTokenPayload extends JWTPayload {
  jti: string // トークンID（UUID v4）
  sub: string // ユーザーID
  email: string
  type: 'access'
}

// JWTペイロード（リフレッシュトークン）
export interface RefreshTokenPayload extends JWTPayload {
  jti: string // トークンID（UUID v4）
  sub: string // ユーザーID
  type: 'refresh'
}

// トークンペア
export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// 有効期限（秒）
const ACCESS_TOKEN_EXPIRY = 60 * 60 // 1時間
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 // 7日間

/**
 * UUIDを生成（トークンID用）
 */
function generateJti(): string {
  return crypto.randomUUID()
}

/**
 * 秘密鍵をインポート（RS256用）
 */
async function getPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
  return importPKCS8(privateKeyPem, 'RS256')
}

/**
 * 公開鍵をインポート（RS256用）
 */
async function getPublicKey(publicKeyPem: string): Promise<CryptoKey> {
  return importSPKI(publicKeyPem, 'RS256')
}

/**
 * アクセストークンを発行
 */
export async function signAccessToken(
  userId: string,
  email: string,
  privateKeyPem: string
): Promise<string> {
  const privateKey = await getPrivateKey(privateKeyPem)
  const jti = generateJti()

  return new SignJWT({
    email,
    type: 'access',
  } as Partial<AccessTokenPayload>)
    .setProtectedHeader({ alg: 'RS256' })
    .setJti(jti)
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRY}s`)
    .sign(privateKey)
}

/**
 * リフレッシュトークンを発行
 */
export async function signRefreshToken(userId: string, privateKeyPem: string): Promise<string> {
  const privateKey = await getPrivateKey(privateKeyPem)
  const jti = generateJti()

  return new SignJWT({
    type: 'refresh',
  } as Partial<RefreshTokenPayload>)
    .setProtectedHeader({ alg: 'RS256' })
    .setJti(jti)
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRY}s`)
    .sign(privateKey)
}

/**
 * トークンペアを発行
 */
export async function signTokenPair(
  userId: string,
  email: string,
  privateKeyPem: string
): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId, email, privateKeyPem),
    signRefreshToken(userId, privateKeyPem),
  ])
  return { accessToken, refreshToken }
}

/**
 * アクセストークンを検証
 */
export async function verifyAccessToken(
  token: string,
  publicKeyPem: string
): Promise<AccessTokenPayload> {
  const publicKey = await getPublicKey(publicKeyPem)
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
  })

  // 型検証
  if (payload.type !== 'access') {
    throw new Error('Invalid token type: expected access token')
  }

  return payload as AccessTokenPayload
}

/**
 * リフレッシュトークンを検証
 */
export async function verifyRefreshToken(
  token: string,
  publicKeyPem: string
): Promise<RefreshTokenPayload> {
  const publicKey = await getPublicKey(publicKeyPem)
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
  })

  // 型検証
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type: expected refresh token')
  }

  return payload as RefreshTokenPayload
}

/**
 * Cookie属性を生成（セキュリティ設計書に準拠）
 * HttpOnly, Secure, SameSite=Strict, Path=/api
 */
export function getCookieOptions(
  maxAge: number,
  isProduction: boolean
): {
  httpOnly: true
  secure: boolean
  sameSite: 'Strict'
  path: string
  maxAge: number
} {
  return {
    httpOnly: true,
    secure: isProduction, // 開発環境ではHTTPSではないのでfalse
    sameSite: 'Strict',
    path: '/api',
    maxAge,
  }
}

/**
 * アクセストークンのCookie設定を取得
 */
export function getAccessTokenCookieOptions(isProduction: boolean) {
  return getCookieOptions(ACCESS_TOKEN_EXPIRY, isProduction)
}

/**
 * リフレッシュトークンのCookie設定を取得
 */
export function getRefreshTokenCookieOptions(isProduction: boolean) {
  return getCookieOptions(REFRESH_TOKEN_EXPIRY, isProduction)
}

/**
 * Cookie削除用の設定を取得
 */
export function getDeleteCookieOptions(isProduction: boolean) {
  return getCookieOptions(0, isProduction)
}
