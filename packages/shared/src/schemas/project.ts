import { z } from 'zod';
import {
  createDataResponseSchema,
  createListResponseSchema,
  datetimeSchema,
  nameSchema,
  uuidSchema,
} from './common';

// プロジェクト詳細スキーマ（04_API設計.md:241-251, 258-268, 285-293）
// APIレスポンス用。ownerIdは含めない（セキュリティ上の理由）
export const projectSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  createdAt: datetimeSchema,
  updatedAt: datetimeSchema,
});

// プロジェクト一覧アイテムスキーマ（04_API設計.md:215-226）
export const projectListItemSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  updatedAt: datetimeSchema,
});

// POST /api/projects リクエスト
export const createProjectRequestSchema = z.object({
  name: nameSchema,
});

// POST /api/projects レスポンス
export const createProjectResponseSchema =
  createDataResponseSchema(projectSchema);

// GET /api/projects レスポンス
export const listProjectsResponseSchema = createListResponseSchema(
  projectListItemSchema
);

// GET /api/projects/:projectId レスポンス
export const getProjectResponseSchema = createDataResponseSchema(projectSchema);

// PATCH /api/projects/:projectId リクエスト
export const updateProjectRequestSchema = z.object({
  name: nameSchema,
});

// PATCH /api/projects/:projectId レスポンス
export const updateProjectResponseSchema =
  createDataResponseSchema(projectSchema);

// パスパラメータスキーマ
export const projectIdParamSchema = z.object({
  projectId: uuidSchema,
});
