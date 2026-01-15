# API設計

## サマリ

このドキュメントでは、エンドポイント一覧、共通仕様（ベースURL/認証方式/リクエストヘッダー/レスポンス形式）、認証API、プロジェクトAPI、同期API、エラー仕様、OpenAPIを定める。SyncHandler一本化でCRDT更新を送受信し、スキーマ駆動開発を採用。

## 変更履歴

| 日付 | 内容 | 意図 |
| --- | --- | --- |
| 20260113 | 初版作成 | - |

## エンドポイント一覧

### REST API

| カテゴリ | メソッド | エンドポイント | 説明 | 認証 |
|---------|---------|---------------|------|------|
| **認証** | POST | `/api/auth/dev-login` | 開発環境用ログイン（development環境のみ） | 不要 |
| | POST | `/api/auth/login` | Google OAuthログイン（開発環境はGOOGLE_CLIENT_ID設定時のみ） | 不要 |
| | POST | `/api/auth/logout` | ログアウト | 必要 |
| | POST | `/api/auth/refresh` | トークンリフレッシュ | 不要 |
| | GET | `/api/auth/me` | 現在のユーザー情報取得 | 必要 |
| **プロジェクト** | GET | `/api/projects` | プロジェクト一覧取得 | 必要 |
| | POST | `/api/projects` | プロジェクト作成 | 必要 |
| | GET | `/api/projects/:projectId` | プロジェクト詳細取得 | 必要 |
| | PATCH | `/api/projects/:projectId` | プロジェクト名更新 | 必要 |
| | DELETE | `/api/projects/:projectId` | プロジェクト削除 | 必要 |
| **同期** | POST | `/api/sync` | CRDT更新の送受信 | 必要 |
| **ヘルスチェック** | GET | `/health` | サービス稼働確認 | 不要 |
| **OpenAPI** | GET | `/api/doc` | OpenAPI仕様書（JSON） | 不要 |
| | GET | `/api/reference` | Scalar API Reference UI | 不要 |

## 共通仕様

### ベースURL

※同一オリジン構成などについて`アーキテクチャ設計書.md`を参照。

### 認証方式

本アプリのPWA・Webブラウザ版では、Cookie認証方式を採用する。認証が必要なエンドポイントでは、JWTトークンがHttpOnly Cookieとして自動送信される。

```
Cookie: access_token=<jwt>; refresh_token=<jwt>
```

| Cookie属性 | 値 | 備考 |
|-----------|-----|------|
| HttpOnly | ✓ | JavaScript からアクセス不可 |
| Secure | ✓ | HTTPS必須（開発環境は除く） |
| SameSite | Strict | 同一オリジン構成により安全に設定可能 |
| Path | /api | API用Cookieとして限定 |

`fetch`呼び出し時に`credentials: 'include'`を指定するだけでCookieが自動送信される。

```typescript
const res = await fetch('/api/projects', {
  credentials: 'include'
});
```

### リクエストヘッダー

| ヘッダー | 必須 | 説明 |
|---------|------|------|
| `Content-Type` | Yes（POST/PATCH） | `application/json` |
| `Cookie` | 認証必要時 | ブラウザが自動送信（明示的な設定不要） |
| `X-Request-Id` | No | リクエスト追跡用ID（クライアント生成） |

### レスポンス形式

#### 成功レスポンス

```typescript
// 単一リソース
{
  "data": {
    // リソースデータ
  }
}

// コレクション
{
  "data": [
    // リソース配列
  ]
}
```

#### エラーレスポンス

```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "fieldName",
      "reason": "詳細な理由"
    }
  }
}
```

### 日時形式

全ての日時はISO 8601形式（UTC）で返却する。

```
2024-01-15T09:30:00.000Z
```

### バイナリ表現

CRDT更新やスナップショットなどの`Uint8Array`はBase64文字列で表現する。

## 認証API

### POST /api/auth/dev-login

開発環境専用のログインエンドポイント。環境変数で指定された固定ユーザーで自動認証する。ユーザーは事前にコマンドで作成しておく必要がある。

**リクエスト**

リクエストボディなし。

**レスポンス（200 OK）**

```typescript
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "dev@example.com"
    }
  }
}
```

**環境変数**

開発環境でも複数ユーザーでログイン可能に。

```bash
# .env.development
DEV_USER_EMAIL=dev@example.com
```

### POST /api/auth/login

Google OAuthによるログイン。ステージング/本番環境では常に利用可能。開発環境ではGOOGLE_CLIENT_IDが設定されている場合のみ利用可能。

**リクエスト**

```typescript
{
  "idToken": "google_id_token"
}
```

**レスポンス（200 OK）**

```typescript
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
}
```

### POST /api/auth/logout

現在のセッションを終了する。

**レスポンス（204 No Content）**

レスポンスボディなし。`access_token`と`refresh_token`のCookieが削除される。

### POST /api/auth/refresh

アクセストークンを更新する。認証不要（リフレッシュトークンのみで更新可能）。

**レスポンス（200 OK）**

```typescript
{
  "data": {}
}
```

### GET /api/auth/me

現在ログイン中のユーザー情報を取得する。

**レスポンス（200 OK）**

```typescript
{
  "data": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

## プロジェクトAPI

### GET /api/projects

ユーザーのプロジェクト一覧を取得する。

**レスポンス（200 OK）**

```typescript
{
  "data": [
    {
      "id": "uuid",
      "name": "プロジェクト名",
      "updatedAt": "2024-01-15T09:30:00.000Z"
    }
  ]
}
```

### POST /api/projects

新規プロジェクトを作成する。

**リクエスト**

```typescript
{
  "name": "プロジェクト名"
}
```

**レスポンス（201 Created）**

```typescript
{
  "data": {
    "id": "uuid",
    "name": "プロジェクト名",
    "createdAt": "2024-01-15T09:30:00.000Z",
    "updatedAt": "2024-01-15T09:30:00.000Z"
  }
}
```

### GET /api/projects/:projectId

プロジェクトの詳細を取得する。

**レスポンス（200 OK）**

```typescript
{
  "data": {
    "id": "uuid",
    "name": "プロジェクト名",
    "createdAt": "2024-01-15T09:30:00.000Z",
    "updatedAt": "2024-01-15T09:30:00.000Z"
  }
}
```

### PATCH /api/projects/:projectId

プロジェクト名を更新する。

**リクエスト**

```typescript
{
  "name": "新しいプロジェクト名"
}
```

**レスポンス（200 OK）**

```typescript
{
  "data": {
    "id": "uuid",
    "name": "新しいプロジェクト名",
    "createdAt": "2024-01-15T09:30:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### DELETE /api/projects/:projectId

プロジェクトを削除する。ゴミ箱機能は持たないため、論理削除は行わない。

**レスポンス（204 No Content）**

レスポンスボディなし。

## 同期API

### POST /api/sync

CRDT更新を送信し、サーバー側の最新更新を受け取る。ファイル/フォルダ操作は`file_tree_docs`と`file_content_docs`のCRDT更新として扱う。

**フィールド説明**

| フィールド | 説明 |
|-----------|------|
| `projectId` |  |
| `clientId` | 。 |
| `targetId` | 更新対象のID。 |

**リクエスト**

```typescript
{
  "projectId": "uuid",  // 同期対象のプロジェクトID
  "clientId": "uuid",   // どのデバイスからの更新か
  "updates": [
    {
      "targetType": "tree",
      "targetId": "uuid", // targetType==treeならprojectId、targetType==contentならfileId
      "update": "base64",
      "createdAt": "2024-01-15T09:30:00.000Z"
    },
    {
      "targetType": "content",
      "targetId": "uuid",
      "update": "base64",
      "createdAt": "2024-01-15T09:30:00.000Z"
    }
  ],
  "stateVectors": {
    "tree": "base64",
    "contents": [
      {
        "fileId": "uuid",
        "stateVector": "base64"
      }
    ]
  }
}
```

**レスポンス（200 OK）**

```typescript
{
  "data": {
    "updates": [
      {
        "targetType": "tree",
        "targetId": "uuid",
        "update": "base64",
        "createdAt": "2024-01-15T09:30:00.000Z"
      }
    ],
    "snapshots": {
      "tree": {
        "doc": "base64",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      },
      "contents": [
        {
          "fileId": "uuid",
          "doc": "base64",
          "updatedAt": "2024-01-15T10:00:00.000Z"
        }
      ]
    },
    "serverTime": "2024-01-15T10:00:00.000Z"
  }
}
```

**エラーレスポンス**

```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "retryable": false  // 4xxエラーはfalse、5xxエラーはtrue
  }
}
```

- `retryable: true` → 指数バックオフでリトライ（最大3回）
- `retryable: false` → リトライせず、エラーをユーザーに通知

| コード | HTTPステータス | retryable | 説明 |
|--------|---------------|-----------|------|
| `VALIDATION_INVALID_INPUT` | 400 | false | リクエスト形式が不正 |
| `VALIDATION_INVALID_TARGET` | 400 | false | targetIdがprojectIdに属さない |
| `UNAUTHORIZED` | 401 | false | 認証エラー |
| `PROJECT_NOT_FOUND` | 404 | false | プロジェクトが存在しない |
| `INTERNAL_ERROR` | 500 | true | サーバー内部エラー |

※CRDT同期の詳細な挙動については`02_アーキテクチャ設計.md`を参照

**targetTypeの検証**

情報保護のため、treeやcontentについてユーザーのアクセス権を検証する。

| targetType | 検証ルール |
| --- | --- |
| `tree` | `targetId === projectId` |
| `content` | `file_content_docs`で`file_id = targetId AND project_id = projectId`が存在 |

- projectIdの検証
  - `projects`テーブルでユーザーが所有するプロジェクトか確認（RLSで自動適用）
- targetIdの検証
  - `targetType: "tree"` → `targetId`が`projectId`と一致するか検証
  - `targetType: "content"` → `file_content_docs`テーブルで当該`file_id`が`projectId`に属するか検証
- 新規作成ファイルの検証
  - `file_content_docs`にレコードが存在するか検証（存在しないなら`project_id = projectId`でINSERT）

## エラー仕様

### HTTPステータスコード

| ステータス | 用途 |
|-----------|------|
| 200 OK | 成功（GET/PATCH） |
| 201 Created | 作成成功（POST） |
| 204 No Content | 成功（DELETE、レスポンスボディなし） |
| 400 Bad Request | リクエスト不正（バリデーションエラー、制約違反等） |
| 401 Unauthorized | 認証エラー（トークンなし、無効、期限切れ） |
| 403 Forbidden | 認可エラー（権限不足） |
| 404 Not Found | リソースが存在しない |
| 409 Conflict | 競合（同名制約など） |
| 429 Too Many Requests | レート制限超過 |
| 500 Internal Server Error | サーバー内部エラー |
| 503 Service Unavailable | サービス一時停止 |

## OpenAPI仕様

### 導入目的

- **スキーマ駆動開発**: Zodスキーマを単一の情報源（Single Source of Truth）とし、バリデーション・型定義・APIドキュメントを自動生成
- **仕様と実装の同期**: 手書きドキュメントの陳腐化を防止
- **型安全なクライアント生成**: フロントエンド用の型付きAPIクライアントを自動生成可能

### 採用ライブラリ

| ライブラリ | 用途 |
|-----------|------|
| `hono-openapi` | HonoミドルウェアとしてOpenAPI仕様を生成 |
| `zod-openapi` | ZodスキーマからOpenAPIスキーマへ変換 |
| `@hono/zod-validator` | Zodによるリクエストバリデーション |
| `@scalar/hono-api-reference` | API Reference UI |

### ドキュメントエンドポイント

| エンドポイント | 説明 | 公開環境 |
|---------------|------|----------|
| GET `/api/doc` | OpenAPI 3.1仕様書（JSON） | 開発環境のみ |
| GET `/api/reference` | Scalar API Reference UI | 開発環境のみ |

```typescript
// 本番環境では無効化
if (process.env.APP_ENV === 'development') {
  app.get('/api/doc', openAPISpecs(app, { documentation: { ... } }))
  app.get('/api/reference', apiReference({ spec: { url: '/api/doc' } }))
}
```

### スキーマ定義方針

**リクエスト/レスポンス定義**

各エンドポイントのリクエスト・レスポンスはZodスキーマで定義し、`zod-openapi`の`.meta()`メソッドでOpenAPIメタデータを追加する。

```typescript
import { z } from 'zod'
// zod-openapi v5 では extendZodWithOpenApi() は不要
// バックエンドのエントリーポイントで import 'zod-openapi' するだけで型が拡張される

// リクエストスキーマ
export const createProjectRequestSchema = z.object({
  name: z.string().min(1).max(100).meta({
    description: 'プロジェクト名',
    example: 'マイプロジェクト'
  })
})

// レスポンススキーマ
export const projectSchema = z.object({
  id: z.uuid().meta({ description: 'プロジェクトID' }),
  name: z.string().meta({ description: 'プロジェクト名' }),
  createdAt: z.iso.datetime().meta({ description: '作成日時（ISO 8601）' }),
  updatedAt: z.iso.datetime().meta({ description: '更新日時（ISO 8601）' })
})
```

**ルート定義**

`describeRoute`ヘルパーでエンドポイントのメタデータを定義する。

```typescript
import { describeRoute } from 'hono-openapi'
import { resolver, validator as zValidator } from 'hono-openapi/zod'

app.post(
  '/api/projects',
  describeRoute({
    tags: ['プロジェクト'],
    summary: 'プロジェクト作成',
    responses: {
      201: { description: '作成成功', content: { 'application/json': { schema: resolver(projectSchema) } } },
      400: { description: 'バリデーションエラー' },
      401: { description: '認証エラー' }
    }
  }),
  zValidator('json', createProjectRequestSchema),
  async (c) => {
    // 実装
  }
)
```

**ファイル構成**

※詳細は`02_アーキテクチャ設計.md`のディレクトリ構成を参照
