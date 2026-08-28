import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createAssignmentSchema,
  listAssignmentsQuerySchema,
} from "../schemas/assignment.schema";
import {
  createAssignment,
  deleteAssignment,
  getAssignmentOrThrow,
  getShipmentsForAssignment,
  listAssignments,
} from "../services/assignmentService";

export const assignmentsRouter = Router();

// GET /assignments?status=&search=
assignmentsRouter.get(
  "/",
  validate(listAssignmentsQuerySchema, "query"),
  asyncHandler((req, res) => {
    const assignments = listAssignments(req.query as any);
    res.json(assignments);
  })
);

// GET /assignments/:id
assignmentsRouter.get(
  "/:id",
  asyncHandler((req, res) => {
    const assignment = getAssignmentOrThrow(req.params.id);
    res.json(assignment);
  })
);

// GET /assignments/:id/shipments
assignmentsRouter.get(
  "/:id/shipments",
  asyncHandler((req, res) => {
    const shipments = getShipmentsForAssignment(req.params.id);
    res.json(shipments);
  })
);

// POST /assignments
assignmentsRouter.post(
  "/",
  validate(createAssignmentSchema),
  asyncHandler((req, res) => {
    const assignment = createAssignment(req.body);
    res.status(201).json(assignment);
  })
);

// DELETE /assignments/:id (only allowed when empty; enforced in the service)
assignmentsRouter.delete(
  "/:id",
  asyncHandler((req, res) => {
    deleteAssignment(req.params.id);
    res.status(204).send();
  })
);
