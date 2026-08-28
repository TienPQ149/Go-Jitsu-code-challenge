import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "./__root";

const shipmentsSearchSchema = z.object({
  status: z.enum(["OPEN", "IN_TRANSIT", "DELIVERED"]).optional(),
  search: z.string().optional(),
  selected: z.string().optional(),
});

export const shipmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: shipmentsSearchSchema,
  component: () => {
    // Placeholder until the ShipmentsPage component is implemented.
    return <div className="p-6">Shipments page (coming soon)</div>;
  },
});
