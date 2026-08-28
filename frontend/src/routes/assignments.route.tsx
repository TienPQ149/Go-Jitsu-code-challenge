import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "./__root";
import { AssignmentsPage } from "../pages/AssignmentsPage";

const assignmentsSearchSchema = z.object({
  status: z.enum(["OPEN", "COMPLETED"]).optional(),
  search: z.string().optional(),
  selected: z.string().optional(),
});

export const assignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assignments",
  validateSearch: assignmentsSearchSchema,
  component: AssignmentsPage,
});
