'use client'

/**
 * Google Sign-In カスタムフック
 *
 * Google Identity Services を使用した認証フローを提供
 * renderButton 方式を使用（HTTP localhost でも動作）
 */

import { useEffect, useState, useRef, RefObject } from 'react'

const GOOGLE_GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client'

interface UseGoogleSignInOptions {
  clientId: string
  onSuccess: (idToken: string) => void | Promise<void>
  onError: (error: Error) => void
  /** ボタンをレンダリングする要素の ref */
  buttonRef: RefObject<HTMLDivElement | null>
}

interface UseGoogleSignInReturn {
  /** GIS ライブラリが読み込まれたか */
  isReady: boolean
  /** ログイン処理中か */
  isLoading: boolean
}

/**
 * Google Identity Services スクリプトをロード
 */
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 既にロード済みの場合
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    // 既にスクリプトタグがある場合
    const existingScript = document.querySelector(`script[src="${GOOGLE_GSI_SCRIPT_URL}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In script')))
      return
    }

    // スクリプトをロード
    const script = document.createElement('script')
    script.src = GOOGLE_GSI_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(script)
  })
}

export function useGoogleSignIn({
  clientId,
  onSuccess,
  onError,
  buttonRef,
}: UseGoogleSignInOptions): UseGoogleSignInReturn {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const initializedRef = useRef(false)
  const callbackRef = useRef({ onSuccess, onError })

  // コールバックを最新に保つ
  useEffect(() => {
    callbackRef.current = { onSuccess, onError }
  }, [onSuccess, onError])

  // GIS を初期化してボタンをレンダリング
  useEffect(() => {
    if (!clientId || initializedRef.current) return

    let mounted = true

    const initializeGIS = async () => {
      try {
        await loadGoogleScript()

        if (!mounted || !window.google?.accounts?.id) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setIsLoading(false)
            if (!response.credential) {
              callbackRef.current.onError(new Error('No credential received'))
              return
            }

            try {
              await callbackRef.current.onSuccess(response.credential)
            } catch (err) {
              callbackRef.current.onError(
                err instanceof Error ? err : new Error('Login failed')
              )
            }
          },
          ux_mode: 'popup',
          auto_select: false,
        })

        initializedRef.current = true
        if (mounted) setIsReady(true)
      } catch (err) {
        if (mounted) {
          callbackRef.current.onError(
            err instanceof Error ? err : new Error('Failed to initialize Google Sign-In')
          )
        }
      }
    }

    initializeGIS()

    return () => {
      mounted = false
    }
  }, [clientId])

  // ボタンをレンダリング
  useEffect(() => {
    if (!isReady || !buttonRef.current || !window.google?.accounts?.id) return

    // 既存の内容をクリア
    buttonRef.current.innerHTML = ''

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
      click_listener: () => {
        setIsLoading(true)
      },
    })
  }, [isReady, buttonRef])

  return {
    isReady,
    isLoading,
  }
}
