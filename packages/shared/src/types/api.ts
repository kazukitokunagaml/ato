import { z } from 'zod'
import {
  loginRequestSchema,
  loginResponseSchema,
  devLoginResponseSchema,
  refreshResponseSchema,
  meResponseSchema,
  createProjectRequestSchema,
  createProjectResponseSchema,
  listProjectsResponseSchema,
  getProjectResponseSchema,
  updateProjectRequestSchema,
  updateProjectResponseSchema,
  syncRequestSchema,
  syncResponseSchema,
  errorResponseSchema,
  syncErrorResponseSchema,
} from '../schemas'

// 認証API
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type DevLoginResponse = z.infer<typeof devLoginResponseSchema>
export type RefreshResponse = z.infer<typeof refreshResponseSchema>
export type MeResponse = z.infer<typeof meResponseSchema>

// プロジェクトAPI
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>
export type CreateProjectResponse = z.infer<typeof createProjectResponseSchema>
export type ListProjectsResponse = z.infer<typeof listProjectsResponseSchema>
export type GetProjectResponse = z.infer<typeof getProjectResponseSchema>
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>
export type UpdateProjectResponse = z.infer<typeof updateProjectResponseSchema>

// 同期API
export type SyncRequest = z.infer<typeof syncRequestSchema>
export type SyncResponse = z.infer<typeof syncResponseSchema>

// エラーレスポンス
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type SyncErrorResponse = z.infer<typeof syncErrorResponseSchema>
