// エラーハンドリングミドルウェア
// - 共通エラーレスポンス形式
// - エラーログ出力

import { ErrorCode } from '@ato/shared';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

type Bindings = {
  APP_ENV?: string;
};

// エラーハンドリングミドルウェア
export const errorMiddleware = createMiddleware<{ Bindings: Bindings }>(
  async (c, next) => {
    try {
      await next();
    } catch (error) {
      // HTTPExceptionの場合
      if (error instanceof HTTPException) {
        return c.json(
          {
            error: {
              code: ErrorCode.INTERNAL_ERROR,
              message: error.message,
            },
          },
          error.status
        );
      }

      // その他のエラー
      console.error('Unhandled error:', error);
      return c.json(
        {
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Internal server error',
          },
        },
        500
      );
    }
  }
);
