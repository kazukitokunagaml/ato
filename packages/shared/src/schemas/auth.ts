import { z } from 'zod';
import { createDataResponseSchema, uuidSchema } from './common';

// APIレスポンス用ユーザー情報スキーマ（04_API設計.md:129-137, 163-171, 200-206）
// 設計に従い、最小限の情報（id, email）のみを返す
export const userResponseSchema = z.object({
  id: uuidSchema,
  email: z.email(),
});

// POST /api/auth/login リクエスト
export const loginRequestSchema = z.object({
  idToken: z.string().min(1, 'IDトークンは必須です'),
});

// POST /api/auth/login レスポンス
export const loginResponseSchema = createDataResponseSchema(
  z.object({
    user: userResponseSchema,
  })
);

// POST /api/auth/dev-login レスポンス
export const devLoginResponseSchema = createDataResponseSchema(
  z.object({
    user: userResponseSchema,
  })
);

// POST /api/auth/refresh レスポンス
export const refreshResponseSchema = createDataResponseSchema(z.object({}));

// GET /api/auth/me レスポンス
export const meResponseSchema = createDataResponseSchema(userResponseSchema);
