# TODO

## 方針

1機能ごとにE2Eテストまで書き切り、品質を担保してから次へ進む

実装前に必要なドキュメントを読ませること

## TODO

### プロジェクト管理

- [ ] 関連設計ドキュメント確認
- [ ] バックエンド実装
  - [ ] `/api/projects` GET（一覧取得）
  - [ ] `/api/projects` POST（作成、初回ログイン時自動作成含む）
  - [ ] `/api/projects/:projectId` GET（詳細取得）
  - [ ] `/api/projects/:projectId` PATCH（名前更新）
  - [ ] `/api/projects/:projectId` DELETE（削除）
  - [ ] プロジェクト名バリデーション（要件定義準拠）
  - [ ] 監査ログ出力（作成/削除）
- [ ] フロントエンド実装
  - [ ] プロジェクト選択UI（サイドパネル内）
  - [ ] プロジェクト作成ダイアログ
  - [ ] プロジェクト削除確認ダイアログ（名前入力）
  - [ ] プロジェクト切り替え処理
  - [ ] プロジェクト切り替え時のローカルデータ削除
  - [ ] `ato:current_project_id` 更新
  - [ ] プロジェクト読み込み（初回/未選択時の自動選択）
  - [ ] 空状態表示（プロジェクト0件）
- [ ] E2Eテスト
  - [ ] E2E-PROJECT-01: プロジェクト切り替え
  - [ ] E2E-PROJECT-02: プロジェクト作成
  - [ ] E2E-PROJECT-03: プロジェクト名更新
  - [ ] E2E-PROJECT-04: プロジェクト削除
  - [ ] E2E-PROJECT-05: プロジェクト削除キャンセル
  - [ ] API結合テスト（projects CRUD）
  - [ ] RLSテスト（他ユーザーのprojectIdアクセス拒否）
  - [ ] プロジェクト名バリデーションテスト
- [ ] 設計ドキュメント更新
  - [ ] 実装内容に合わせてドキュメント最新化

### ファイルツリー・CRDT基盤

- [ ] 関連設計ドキュメント確認
- [ ] 共通パッケージ
  - [ ] Yjs導入
  - [ ] FileTreeDoc型定義
  - [ ] FileContentDoc型定義
  - [ ] CRDTUpdate型定義
- [ ] バックエンド実装
  - [ ] `/api/sync` POST（CRDT更新送受信）
  - [ ] `/api/sync` バリデーション（projectId/targetType/targetId）
  - [ ] `file_content_docs` 既存確認と初回INSERT
  - [ ] 初期同期（stateVectors空→スナップショット返却）
  - [ ] レート制限（60回/分/ユーザー）
  - [ ] 監査ログ出力（同期操作）
- [ ] フロントエンド実装
  - [ ] ローカルストレージ管理（CRDT保存/復元）
  - [ ] CRDTスナップショットBase64化
  - [ ] `ato:file_tree_doc:{projectId}` / `ato:file_content_doc:{fileId}` 永続化
  - [ ] SyncManager基盤
  - [ ] ファイルツリーUI（サイドパネル）
  - [ ] ファイル作成
  - [ ] フォルダ作成
  - [ ] ファイル/フォルダ改名
  - [ ] ファイル/フォルダ削除
  - [ ] ドラッグ&ドロップ移動
  - [ ] 空状態表示（ファイル0件）
  - [ ] ファイル/フォルダ名バリデーション（要件定義準拠）
- [ ] E2Eテスト
  - [ ] E2E-FILE-01: ファイル作成
  - [ ] E2E-FILE-03: ファイル改名
  - [ ] E2E-FILE-04: ファイル削除
  - [ ] E2E-FOLDER-01: フォルダ作成
  - [ ] E2E-FOLDER-02: フォルダ展開/折りたたみ
  - [ ] E2E-FOLDER-03: フォルダ内ファイル作成
  - [ ] E2E-FOLDER-04: フォルダ削除
  - [ ] UT-CRDT（FileTreeDoc/FileContentDoc/Yjs）
  - [ ] UT-SYNC（SyncState）
  - [ ] IT-API（/api/sync）
  - [ ] IT-DB（file_tree_docs/file_content_docs/RLS）
  - [ ] IT-SYNC（同期結合）
- [ ] 設計ドキュメント更新
  - [ ] 実装内容に合わせてドキュメント最新化

### エディター

- [ ] 関連設計ドキュメント確認
- [ ] フロントエンド実装
  - [ ] CodeMirror導入・設定
  - [ ] エディターコンポーネント
  - [ ] ファイル選択→エディター表示連携
  - [ ] 編集→CRDT更新→自動保存
  - [ ] Undo/Redo（Yjs UndoManager）
  - [ ] 空状態表示（ファイル未選択）
  - [ ] キーボード操作制約（Undo/Redo + CodeMirror既定のみ）
  - [ ] パネル表示中の入力不可 + ぼかし
  - [ ] パネル閉じ時の入力状態復帰（タップ操作）
- [ ] E2Eテスト
  - [ ] E2E-FILE-02: ファイル編集（自動保存、同期実行）
  - [ ] UT-COMP（Editor: 初期表示/入力時コールバック）
  - [ ] UT-HOOK（useEditor）
- [ ] 設計ドキュメント更新
  - [ ] 実装内容に合わせてドキュメント最新化

### 同期機能

- [ ] 関連設計ドキュメント確認
- [ ] フロントエンド実装
  - [ ] オンライン/オフライン検知
  - [ ] 同期状態管理（5状態遷移）
  - [ ] 同期状態アイコン表示
  - [ ] オフライン時の操作蓄積
  - [ ] オンライン復帰時の自動同期
  - [ ] リトライ処理（最大3回、指数バックオフ）
  - [ ] 同期エラーダイアログ
  - [ ] 「未同期データを削除」→サーバーから再取得
  - [ ] retryableルール（4xxはリトライなし、5xxのみリトライ）
  - [ ] 同期処理の非同期実行（UIをブロックしない）
  - [ ] 同期後のローカル/サーバー同一状態担保
  - [ ] 同期状態アイコン詳細（回転/警告）
  - [ ] 同期エラーダイアログ文言・選択肢（設計準拠）
- [ ] E2Eテスト
  - [ ] E2E-SYNC-01: オンライン同期
  - [ ] E2E-SYNC-02: オフライン編集
  - [ ] E2E-SYNC-03: オンライン復帰
  - [ ] E2E-SYNC-04: リトライ失敗
  - [ ] UT-COMP（SyncStatus: 状態別アイコン）
  - [ ] UT-SYNC（retryable/ダイアログ遷移）
- [ ] 設計ドキュメント更新
  - [ ] 実装内容に合わせてドキュメント最新化

### インポート/エクスポート

- [ ] 関連設計ドキュメント確認
- [ ] フロントエンド実装
  - [ ] ZIPエクスポート（JSZip使用、オフライン対応）
  - [ ] フォルダインポート（File System Access API）
  - [ ] インポート検証・ロールバック
  - [ ] トースト通知（完了/エラー）
  - [ ] プロジェクト未選択時の制御（実行不可/誘導）
  - [ ] インポート時のフォルダ追加・ローカル操作記録
  - [ ] インポート検証項目の明確化（構造/上限/容量/名前）
  - [ ] トースト文言（エクスポート完了/インポート完了/インポートエラー）
- [ ] E2Eテスト
  - [ ] E2E-EXIM-01: ZIPエクスポート
  - [ ] E2E-EXIM-02: フォルダインポート
  - [ ] E2E-EXIM-03: インポート失敗
- [ ] 設計ドキュメント更新
  - [ ] 実装内容に合わせてドキュメント最新化

### 設定・UI仕上げ

- [ ] 関連設計ドキュメント確認
- [ ] フロントエンド実装
  - [ ] 設定パネル（フォント、フォントサイズ、行折り返し、テーマ）
  - [ ] 設定パネル内の同期情報表示（状態/時刻/待機/失敗）
  - [ ] 設定のローカルストレージ保存
  - [ ] ログアウト導線（設定パネル）
  - [ ] メイン画面レイアウト完成（SC-02）
  - [ ] サイドパネルアニメーション
  - [ ] トースト通知システム
  - [ ] トースト表示位置・優先度（最上部/最前面）
  - [ ] APIステータス→トースト文言変換
  - [ ] 401時のリダイレクト制御
- [ ] E2Eテスト
  - [ ] 設定変更が反映されることを確認
  - [ ] UT-HOOK（設定保存/復元）
  - [ ] UT-COMP（Toast）
- [ ] 設計ドキュメント更新
  - [ ] 実装内容に合わせてドキュメント最新化

### 容量制限・PWA

- [ ] 関連設計ドキュメント確認
- [ ] フロントエンド実装
  - [ ] 容量超過検知
  - [ ] 容量超過ダイアログ
  - [ ] Service Worker（PWA）
  - [ ] オフラインキャッシュ戦略
  - [ ] 容量超過時の操作制限（閲覧/削除/エクスポートのみ許可）
  - [ ] 容量超過ダイアログ仕様（✕なし/操作必須/文言/ボタン）
  - [ ] PWAキャッシュ戦略詳細（プリキャッシュ、Network First/Only）
  - [ ] キャッシュ名ハッシュ化・旧キャッシュ削除
  - [ ] オフライン+キャッシュ無し時の案内表示
- [ ] E2Eテスト
  - [ ] E2E-STORAGE-01: 容量超過ダイアログ表示
  - [ ] E2E-STORAGE-02: 容量超過→ファイル削除
  - [ ] E2E-STORAGE-03: 容量超過→エクスポート
  - [ ] UT-Storage（容量境界/QuotaExceededError）
- [ ] 設計ドキュメント更新
  - [ ] 実装内容に合わせてドキュメント最新化

### 最終確認・リリース準備

- [ ] 全E2Eテスト通過確認
- [ ] ステージング環境での手動検証
- [ ] Google OAuth手動検証（ステージング/本番）
- [ ] dev-login無効化確認（ステージング/本番）
- [ ] パフォーマンス確認
- [ ] セキュリティチェック（OWASP Top 10）
- [ ] セキュリティ結合テスト項目の実施（IT-SEC）
- [ ] 依存関係の脆弱性チェック（npm audit）
- [ ] 本番デプロイ
- [ ] 本番スモークテスト（フロント/API）
- [ ] 監視/ログ確認（Vercel/Workers Logs）

## 完了済み

### DNS・CI/CD

- [x] DNSレコード設定
  - [x] `ato-editor.app` → Vercel
  - [x] `staging.ato-editor.app` → Vercel
  - [x] `api.ato-editor.app` → Cloudflare Workers
  - [x] `api-staging.ato-editor.app` → Cloudflare Workers
- [x] GitHub Actions設定
  - [x] Repository Secrets
    - [x] `VERCEL_TOKEN`
    - [x] `VERCEL_ORG_ID`
    - [x] `VERCEL_PROJECT_ID`
    - [x] `CLOUDFLARE_API_TOKEN`
    - [x] `CLOUDFLARE_ACCOUNT_ID`
  - [x] CI/CDワークフロー作成

### 外部サービス設定

- [x] ドメイン取得（`ato-editor.app`）
- [x] Neon（PostgreSQL）
  - [x] プロジェクト作成
  - [x] Production / Staging / Development Branch
  - [x] 接続文字列取得
- [x] Google Cloud Console（OAuth）
  - [x] OAuth同意画面設定
  - [x] Client ID / Client Secret 取得（本番・ステージング）
- [x] JWT鍵ペア生成（本番・ステージング・開発）

保存先: `.keep/env/`, `.keep/jwt/`

### モノレポ基盤

- [x] pnpm インストール確認
- [x] ルート設定ファイル作成
  - [x] `pnpm-workspace.yaml`
  - [x] `package.json`（ルート）
  - [x] `tsconfig.base.json`
  - [x] `.gitignore` 更新（`.env.*` 追加）
  - [x] `.env.sample`
- [x] packages/shared 作成
  - [x] `package.json`
  - [x] `tsconfig.json`
  - [x] `src/config/env.ts`（環境変数ヘルパー）

### バックエンド（Cloudflare Workers）

- [x] apps/backend 作成
  - [x] `package.json`, `tsconfig.json`
  - [x] `wrangler.toml`（本番・ステージング）
  - [x] `src/index.ts`（エントリーポイント）
- [x] ステージングデプロイ
  - [x] `wrangler deploy --env staging`
  - [x] Secrets設定（ステージング）
    - [x] `DATABASE_URL`
    - [x] `JWT_PRIVATE_KEY`
    - [x] `JWT_PUBLIC_KEY`
    - [x] `GOOGLE_CLIENT_ID`
    - [x] `GOOGLE_CLIENT_SECRET`
    - [x] `APP_ENV=staging`
- [x] 本番デプロイ
  - [x] `wrangler deploy --env production`
  - [x] Secrets設定（本番）
    - [x] `DATABASE_URL`
    - [x] `JWT_PRIVATE_KEY`
    - [x] `JWT_PUBLIC_KEY`
    - [x] `GOOGLE_CLIENT_ID`
    - [x] `GOOGLE_CLIENT_SECRET`
    - [x] `APP_ENV=production`

### フロントエンド（Vercel）

- [x] apps/frontend/web 作成
  - [x] `package.json`, `tsconfig.json`
  - [x] `next.config.ts`（API Rewrite設定）
- [x] Vercel連携
  - [x] プロジェクト作成・GitHub連携
  - [x] 環境変数設定（Production）
    - [x] `NEXT_PUBLIC_APP_ENV=production`
    - [x] `API_URL=https://api.ato-editor.app`
    - [x] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - [x] 環境変数設定（Preview/Staging）
    - [x] `NEXT_PUBLIC_APP_ENV=staging`
    - [x] `API_URL=https://api-staging.ato-editor.app`
    - [x] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - [x] カスタムドメイン設定
    - [x] 本番: `ato-editor.app`
    - [x] ステージング: `staging.ato-editor.app`

### 基盤整備

- [x] 関連設計ドキュメント確認
- [x] E2Eテスト環境構築
  - [x] Playwright導入（apps/frontend/web）
  - [x] テスト用設定ファイル作成
  - [x] CIへのE2Eテスト組み込み
- [x] DB接続・マイグレーション基盤
  - [x] Drizzle ORM導入（apps/backend）
  - [x] スキーマ定義（users, projects, file_tree_docs, file_content_docs）
  - [x] マイグレーション実行環境構築
  - [x] RLS設定
- [x] 共通パッケージ整備
  - [x] Zod スキーマ定義（packages/shared）
  - [x] API型定義（リクエスト/レスポンス）
  - [x] エンティティ型定義
- [x] ユニット/結合テスト基盤
  - [x] Vitest導入（apps/backend, packages/shared）
  - [x] テストファクトリ実装（06_テスト設計.md:395-452）
  - [x] Neon Dev ブランチ接続環境（08_運用デプロイ設計.md:55）
- [x] OpenAPI基盤（04_API設計.md:441-541）
  - [x] hono-openapi導入
  - [x] zod-openapi導入
  - [x] @scalar/hono-api-reference導入
  - [x] `/api/doc`, `/api/reference`エンドポイント（開発環境のみ）
- [x] ローカルストレージキー定義（03_データ設計.md:82-100）
  - [x] キー定数定義（packages/shared）
- [x] 設計ドキュメント更新
  - [x] 実装内容に合わせてドキュメント最新化
- [x] ディレクトリ構成を設計通りに整備
  - [x] routes/（auth.ts, projects.ts, sync.ts）
  - [x] middleware/（auth.ts, error.ts）
  - [x] index.tsからルートをマウント
- [x] 結合テスト基盤（Testcontainers + Honoテスト方式）
  - Supertestは不採用（Hono/Cloudflare Workers非対応）
  - Honoの`app.request()`でAPIテスト
  - Testcontainersでpostgresコンテナ起動
  - 設計書更新（06_テスト設計.md）
- [x] vitestコマンド分離（:unit / :integration）
  - `test:unit`: ユニットテストのみ
  - `test:integration`: 結合テストのみ（Testcontainers使用）
- [x] シードスクリプト作成
  - `apps/backend/src/db/seed.ts`
  - `pnpm db:seed`コマンド追加
- [x] /health エンドポイントをAPI設計書に追記
  - 04_API設計.mdに記載追加

### 認証系テスト改善

- [x] 結合テスト修正
  - [x] Set-Cookie→Cookieヘッダー変換を修正（extractCookie/setCookieToCookie関数追加）
  - [x] IT-API-04: 有効なリフレッシュトークンでの成功パス追加（トークンローテーション検証）
  - [x] IT-API-08追加: dev-login初回ユーザー作成フロー（ユーザー→プロジェクト→file_tree_docs自動作成）
- [x] 結合テスト追加（エラーケース・環境別）9件
  - [x] /api/auth/dev-login: APP_ENV=staging で 404
  - [x] /api/auth/dev-login: DEV_USER_EMAIL 未設定で 500
  - [x] /api/auth/dev-login: JWT_PRIVATE_KEY 未設定で 500
  - [x] /api/auth/refresh: JWT_PUBLIC_KEY 未設定で 500
  - [x] /api/auth/refresh: JWT_PRIVATE_KEY 未設定で 500
  - [x] /api/auth/refresh: トークン有効だがユーザー不在で 401
  - [x] /api/auth/me: JWT_PUBLIC_KEY 未設定で 500
  - [x] /api/auth/me: 無効アクセストークン（署名不一致）で 401
  - [x] /api/auth/me: 改ざんされたトークンで 401
- [x] JWT単体テスト（jwt.test.ts）21件
  - [x] signAccessToken: 発行・jti一意性・無効鍵エラー
  - [x] signRefreshToken: 発行・無効鍵エラー
  - [x] signTokenPair: 両トークン返却
  - [x] verifyAccessToken: 正常系・ペイロード検証（sub, email, type, jti, iat, exp）
  - [x] verifyRefreshToken: 正常系・ペイロード検証
  - [x] 異常系: 期限切れトークン → エラー（アクセス1時間/リフレッシュ7日）
  - [x] 異常系: 改ざんされたトークン → エラー
  - [x] 異常系: 異なる鍵で署名されたトークン → エラー
  - [x] 異常系: 不正な形式のトークン → エラー
  - [x] 異常系: アクセストークンをリフレッシュとして検証 → エラー（type不一致）
  - [x] 異常系: リフレッシュトークンをアクセスとして検証 → エラー（type不一致）
  - [x] getCookieOptions: httpOnly=true, sameSite=Strict, path=/api
  - [x] getCookieOptions: 本番環境でsecure=true、開発環境でsecure=false
  - [x] getAccessTokenCookieOptions: maxAge=3600
  - [x] getRefreshTokenCookieOptions: maxAge=7日
  - [x] getDeleteCookieOptions: maxAge=0
- [x] レートリミット単体テスト（rate-limit.test.ts）21件
  - [x] getConfigForPath: /api/auth/dev-login=5
  - [x] getConfigForPath: /api/auth/login=5
  - [x] getConfigForPath: /api/auth/refresh=10
  - [x] getConfigForPath: /api/sync/*=60（プレフィックスマッチ）
  - [x] getConfigForPath: default=100
  - [x] checkRateLimit: 制限内リクエストは許可
  - [x] checkRateLimit: 制限超過で拒否
  - [x] checkRateLimit: ウィンドウリセット後に再び許可
  - [x] checkRateLimit: 異なるキーは独立カウント
  - [x] checkRateLimit: resetAt検証
  - [x] recordLoginFailure: カウント増加
  - [x] recordLoginFailure: 10回失敗でロック
  - [x] recordLoginFailure: 異なるユーザーは独立カウント
  - [x] isAccountLocked: 未ロックはfalse
  - [x] isAccountLocked: ロック中はtrue
  - [x] resetLoginFailures: ログイン成功でカウントリセット
  - [x] resetLoginFailures: ロック状態もリセット
  - [x] アカウントロック: 30分後に解除（vi.useFakeTimers）
  - [x] アカウントロック: 解除後はカウント1から再開

### 認証機能

- [x] 関連設計ドキュメント確認
- [x] バックエンド実装
  - [x] `/api/auth/dev-login` POST（開発用）
  - [x] `/api/auth/login` POST（Google OAuth）
  - [x] `/api/auth/logout` POST
  - [x] `/api/auth/refresh` POST
  - [x] `/api/auth/me` GET
  - [x] JWT発行・検証ミドルウェア
  - [x] レート制限（設計通り）
  - [x] アカウントロック（10回失敗で30分）
  - [x] リフレッシュトークンのローテーション
  - [x] Cookie属性（HttpOnly/Secure/SameSite=Strict）
  - [x] 監査ログ出力（認証イベント）
  - [x] 結合テスト（IT-API-01〜07）
- [x] 結合テスト(/api/auth/login Google OAuth)
  - [x] /api/auth/login: APP_ENV=development で 404
  - [x] /api/auth/login: GOOGLE_CLIENT_ID 未設定で 500
  - [x] /api/auth/login: JWT_PRIVATE_KEY 未設定で 500
  - [x] /api/auth/login: idToken 無効（Google API エラー）で 401
  - [x] /api/auth/login: aud 不一致で 401
  - [x] /api/auth/login: 正常OAuthログイン（既存ユーザー）で 200
  - [x] /api/auth/login: 初回OAuthログイン（新規ユーザー作成フロー）
- [x] フロントエンド実装
  - [x] ログイン画面（SC-01）
  - [x] AuthManager（認証状態管理）
  - [x] 認証ガード（未認証時リダイレクト）
  - [x] セッション期限切れ警告（24時間前通知 + エクスポート導線）
- [x] E2Eテスト
  - [x] E2E-AUTH-01: 初回ログイン
  - [x] E2E-AUTH-02: 再ログイン
  - [x] E2E-AUTH-03: ログアウト
  - [x] E2E-AUTH-04: 未認証リダイレクト
  - [x] E2E-AUTH-05: セッション期限切れ警告
- [x] 設計ドキュメント更新
  - [x] 実装内容に合わせてドキュメント最新化

### デプロイチェック

- [x] 環境変数の管理
- [x] CICDの動作確認