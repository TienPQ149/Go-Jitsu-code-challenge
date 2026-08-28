import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Must run before any schema file calls `.openapi(...)` on a Zod schema.
// Importing this module (even just for its side effect) guarantees that.
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();
