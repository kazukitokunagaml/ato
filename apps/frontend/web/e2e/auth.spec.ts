/**
 * 認証E2Eテスト
 *
 * E2E-AUTH-01〜05に準拠
 */

import { test, expect } from '@playwright/test'

test.describe('E2E-AUTH: 認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // ローカルストレージをクリア
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('E2E-AUTH-01: 初回ログイン - メイン画面表示', async ({ page }) => {
    // 1. ログイン画面にアクセス
    await page.goto('/login')

    // 2. 開発ログインボタンが表示されている
    const loginButton = page.getByTestId('dev-login-button')
    await expect(loginButton).toBeVisible()

    // 3. ログインボタンをクリック
    await loginButton.click()

    // 4. メイン画面に遷移
    await expect(page).toHaveURL('/')

    // 5. ユーザー情報が表示されている
    const userEmail = page.getByTestId('user-email')
    await expect(userEmail).toBeVisible()
    await expect(userEmail).toContainText('@')

    // 6. ログアウトボタンが表示されている
    const logoutButton = page.getByTestId('logout-button')
    await expect(logoutButton).toBeVisible()
  })

  test('E2E-AUTH-02: 再ログイン - 既存データ表示', async ({ page }) => {
    // 1. 初回ログイン
    await page.goto('/login')
    await page.getByTestId('dev-login-button').click()
    await expect(page).toHaveURL('/')

    // ユーザーメールを記録
    const userEmail = await page.getByTestId('user-email').textContent()

    // 2. ログアウト
    await page.getByTestId('logout-button').click()
    await expect(page).toHaveURL('/login')

    // 3. 再ログイン
    await page.getByTestId('dev-login-button').click()
    await expect(page).toHaveURL('/')

    // 4. 同じユーザー情報が表示される
    await expect(page.getByTestId('user-email')).toHaveText(userEmail!)
  })

  test('E2E-AUTH-03: ログアウト - ログイン画面表示', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login')
    await page.getByTestId('dev-login-button').click()
    await expect(page).toHaveURL('/')

    // 2. ログアウトボタンをクリック
    await page.getByTestId('logout-button').click()

    // 3. ログイン画面に遷移
    await expect(page).toHaveURL('/login')

    // 4. ログインボタンが表示されている
    await expect(page.getByTestId('dev-login-button')).toBeVisible()

    // 5. 認証タイムスタンプがクリアされている
    const authTimestamp = await page.evaluate(() => localStorage.getItem('ato:auth_timestamp'))
    expect(authTimestamp).toBeNull()
  })

  test('E2E-AUTH-04: 未認証でメイン画面アクセス - ログイン画面へリダイレクト', async ({ page }) => {
    // 1. 未認証状態でメイン画面にアクセス
    await page.goto('/')

    // 2. ログイン画面にリダイレクト
    await expect(page).toHaveURL('/login')

    // 3. ログインボタンが表示されている
    await expect(page.getByTestId('dev-login-button')).toBeVisible()
  })

  test('E2E-AUTH-05: セッション期限切れ警告 - 警告表示とエクスポート導線', async ({ page }) => {
    // 1. ログイン
    await page.goto('/login')
    await page.getByTestId('dev-login-button').click()
    await expect(page).toHaveURL('/')

    // 2. 認証タイムスタンプを6日前に設定（24時間以内に期限切れ）
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000
    await page.evaluate((timestamp) => {
      localStorage.setItem('ato:auth_timestamp', timestamp.toString())
    }, sixDaysAgo)

    // 3. ページをリロード
    await page.reload()

    // 4. 警告が表示される（1分待機を避けるため、ローカルストレージ設定後にリロード）
    // 警告表示をトリガーするためにセッションチェックを実行
    await page.waitForTimeout(100)

    // 5. セッション期限警告が表示されている
    const warning = page.getByTestId('session-expiry-warning')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('セッションがまもなく期限切れ')

    // 6. エクスポートボタンが表示されている
    const exportButton = page.getByTestId('export-button')
    await expect(exportButton).toBeVisible()

    // 7. 警告を閉じる
    const dismissButton = page.getByTestId('dismiss-warning')
    await dismissButton.click()

    // 8. 警告が非表示になる
    await expect(warning).not.toBeVisible()
  })
})
