import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "./__root";

const assignmentsSearchSchema = z.object({
  status: z.enum(["OPEN", "COMPLETED"]).optional(),
  search: z.string().optional(),
  selected: z.string().optional(),
});

export const assignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assignments",
  validateSearch: assignmentsSearchSchema,
  component: () => {
    // Placeholder until the AssignmentsPage component is implemented (Extra Credit).
    return <div className="p-6">Assignments page (coming soon)</div>;
  },
});
