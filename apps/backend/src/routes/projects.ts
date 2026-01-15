// プロジェクトルート
// GET /api/projects - プロジェクト一覧取得
// POST /api/projects - プロジェクト作成
// GET /api/projects/:projectId - プロジェクト詳細取得
// PATCH /api/projects/:projectId - プロジェクト名更新
// DELETE /api/projects/:projectId - プロジェクト削除

import { Hono } from 'hono';

type Bindings = {
  APP_ENV?: string;
  DATABASE_URL?: string;
};

const projects = new Hono<{ Bindings: Bindings }>();

// TODO: プロジェクトAPI実装

export default projects;
