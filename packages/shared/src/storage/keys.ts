/**
 * ローカルストレージキー定義
 * @see docs/03_データ設計.md:82-100
 */

const PREFIX = 'ato'

/**
 * ファイルツリーCRDTスナップショット
 * 型: string (Base64)
 */
export const FILE_TREE_DOC_KEY = (projectId: string): string =>
  `${PREFIX}:file_tree_doc:${projectId}`

/**
 * ファイル内容CRDTスナップショット
 * 型: string (Base64)
 */
export const FILE_CONTENT_DOC_KEY = (fileId: string): string =>
  `${PREFIX}:file_content_doc:${fileId}`

/**
 * ユーザー設定
 * 型: string (JSON)
 */
export const SETTINGS_KEY = `${PREFIX}:settings`

/**
 * 選択中プロジェクトID
 * 型: string
 */
export const CURRENT_PROJECT_ID_KEY = `${PREFIX}:current_project_id`

/**
 * 選択中ファイルID
 * 型: string
 */
export const CURRENT_FILE_ID_KEY = `${PREFIX}:current_file_id`

/**
 * 全てのストレージキープレフィックス
 * ストレージクリア時などに使用
 */
export const STORAGE_PREFIX = PREFIX
