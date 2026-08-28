import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Type-safe fetch client generated against the backend's OpenAPI spec
 * (see `npm run gen-api`). Every call is checked against `schema.d.ts`,
 * so a path, method, query param, or response shape that doesn't match
 * the backend is a compile-time error instead of a runtime surprise.
 */
export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001",
});
