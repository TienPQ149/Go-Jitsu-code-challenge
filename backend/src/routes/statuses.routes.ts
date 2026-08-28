import { Router } from "express";

export const statusesRouter = Router();

// GET /statuses - matches the shape produced by generated-data.js in the spec
statusesRouter.get("/", (_req, res) => {
  res.json([{ id: "OPEN" }, { id: "IN_TRANSIT" }, { id: "DELIVERED" }]);
});
