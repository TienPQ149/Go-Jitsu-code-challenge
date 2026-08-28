import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "./__root";
import { ShipmentsPage } from "../pages/ShipmentsPage";

const shipmentsSearchSchema = z.object({
  status: z.enum(["OPEN", "IN_TRANSIT", "DELIVERED"]).optional(),
  search: z.string().optional(),
  selected: z.string().optional(),
});

export const shipmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: shipmentsSearchSchema,
  component: ShipmentsPage,
});

