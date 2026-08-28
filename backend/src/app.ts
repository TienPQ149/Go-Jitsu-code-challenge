import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/errorHandler";
import { shipmentsRouter } from "./routes/shipments.routes";
import { assignmentsRouter } from "./routes/assignments.routes";
import { statusesRouter } from "./routes/statuses.routes";
import { generateOpenApiDocument } from "./openapi/document";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // OpenAPI spec: this is the single source of truth the frontend's
  // `npm run gen-api` script reads to generate TypeScript types.
  app.get("/docs/json", (_req, res) => res.json(generateOpenApiDocument()));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(generateOpenApiDocument()));

  app.use("/shipments", shipmentsRouter);
  app.use("/assignments", assignmentsRouter);
  app.use("/statuses", statusesRouter);

  // Must be registered last so it catches errors from all routes above.
  app.use(errorHandler);

  return app;
}

