// 同期ルート
// POST /api/sync - CRDT更新の送受信

import { Hono } from 'hono';

type Bindings = {
  APP_ENV?: string;
  DATABASE_URL?: string;
};

const sync = new Hono<{ Bindings: Bindings }>();

// TODO: 同期API実装

export default sync;
