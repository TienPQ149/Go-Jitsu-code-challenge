import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { shipmentsRoute } from "./routes/shipments.route";
import { assignmentsRoute } from "./routes/assignments.route";

const routeTree = rootRoute.addChildren([shipmentsRoute, assignmentsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
