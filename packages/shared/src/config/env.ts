export type AppEnv = 'development' | 'staging' | 'production'

export const APP_ENV = (process.env.APP_ENV || 'development') as AppEnv

export const isDevelopment = APP_ENV === 'development'
export const isStaging = APP_ENV === 'staging'
export const isProduction = APP_ENV === 'production'
