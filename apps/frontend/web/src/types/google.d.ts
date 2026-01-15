/**
 * Google Identity Services (GIS) 型定義
 *
 * @see https://developers.google.com/identity/gsi/web/reference/js-reference
 */

declare namespace google.accounts.id {
  interface IdConfiguration {
    /** Google Cloud Console で取得したクライアント ID */
    client_id: string
    /** IDトークンを受け取るコールバック関数 */
    callback: (response: CredentialResponse) => void
    /** ログインフロー（popup または redirect） */
    ux_mode?: 'popup' | 'redirect'
    /** 自動選択を有効にするか */
    auto_select?: boolean
    /** Google One Tap プロンプトを表示するか */
    use_fedcm_for_prompt?: boolean
    /** ログインヒント（メールアドレス） */
    login_hint?: string
    /** 既存セッションを使用しない */
    prompt_parent_id?: string
    /** nonce 値 */
    nonce?: string
    /** state パラメータ */
    state?: string
    /** コンテキスト（signin, signup, use） */
    context?: 'signin' | 'signup' | 'use'
    /** itp_support */
    itp_support?: boolean
    /** 中間 iframe のサポート */
    intermediate_iframe_close_callback?: () => void
  }

  interface CredentialResponse {
    /** JWT 形式の ID トークン */
    credential: string
    /** 認証方法（auto, user, btn） */
    select_by: string
    /** クライアント ID */
    clientId?: string
  }

  interface GsiButtonConfiguration {
    /** ボタンタイプ */
    type: 'standard' | 'icon'
    /** ボタンテーマ */
    theme?: 'outline' | 'filled_blue' | 'filled_black'
    /** ボタンサイズ */
    size?: 'large' | 'medium' | 'small'
    /** ボタンテキスト */
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
    /** ボタン形状 */
    shape?: 'rectangular' | 'pill' | 'circle' | 'square'
    /** ロゴ配置 */
    logo_alignment?: 'left' | 'center'
    /** ボタン幅 */
    width?: string | number
    /** ロケール */
    locale?: string
    /** クリックリスナー */
    click_listener?: () => void
  }

  interface PromptMomentNotification {
    /** プロンプト表示理由 */
    getMomentType(): 'display' | 'skipped' | 'dismissed'
    /** プロンプトがスキップされた理由 */
    getSkippedReason(): string | null
    /** プロンプトが閉じられた理由 */
    getDismissedReason(): string | null
    /** 一時的なエラーかどうか */
    isNotDisplayed(): boolean
    /** 表示されたかどうか */
    isDisplayed(): boolean
    /** スキップされたかどうか */
    isSkippedMoment(): boolean
    /** 閉じられたかどうか */
    isDismissedMoment(): boolean
  }

  /**
   * Google Identity Services を初期化
   */
  function initialize(config: IdConfiguration): void

  /**
   * Google One Tap プロンプトを表示
   */
  function prompt(callback?: (notification: PromptMomentNotification) => void): void

  /**
   * Google Sign-In ボタンをレンダリング
   */
  function renderButton(
    parent: HTMLElement,
    options: GsiButtonConfiguration,
    clickHandler?: () => void
  ): void

  /**
   * FedCM プロンプトをキャンセル
   */
  function cancel(): void

  /**
   * ユーザーをログアウト
   */
  function disableAutoSelect(): void

  /**
   * ヒントを保存
   */
  function storeCredential(
    credential: { id: string; password: string },
    callback?: () => void
  ): void

  /**
   * 保存されたヒントを削除
   */
  function revoke(hint: string, callback?: (done: { successful: boolean; error?: string }) => void): void
}

declare global {
  interface Window {
    google?: typeof google
  }
}

export {}
