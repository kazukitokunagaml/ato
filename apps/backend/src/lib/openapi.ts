// OpenAPI 型拡張モジュール
// index.ts で import することで Zod の .meta() に OpenAPI 型定義を追加する
// 参考: https://github.com/samchungy/zod-openapi

// zod-openapi v5 では extendZodWithOpenApi() は不要
// import するだけで Zod の .meta() インターフェースが拡張される
import 'zod-openapi'
