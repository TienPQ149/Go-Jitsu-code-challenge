import { describe, expect, it } from "vitest";
import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("builds stable shipment list/detail key shapes", () => {
    expect(queryKeys.shipments.all).toEqual(["shipments"]);
    expect(queryKeys.shipments.lists()).toEqual(["shipments", "list"]);
    expect(queryKeys.shipments.list({ status: "OPEN" })).toEqual([
      "shipments",
      "list",
      { status: "OPEN" },
    ]);
    expect(queryKeys.shipments.details()).toEqual(["shipments", "detail"]);
    expect(queryKeys.shipments.detail("shp_001")).toEqual([
      "shipments",
      "detail",
      "shp_001",
    ]);
    expect(queryKeys.shipments.validTransitions("shp_001")).toEqual([
      "shipments",
      "valid-transitions",
      "shp_001",
    ]);
  });

  it("builds stable assignment list/detail/shipments key shapes", () => {
    expect(queryKeys.assignments.all).toEqual(["assignments"]);
    expect(queryKeys.assignments.lists()).toEqual(["assignments", "list"]);
    expect(queryKeys.assignments.list({ status: "OPEN" })).toEqual([
      "assignments",
      "list",
      { status: "OPEN" },
    ]);
    expect(queryKeys.assignments.detail("as_001")).toEqual([
      "assignments",
      "detail",
      "as_001",
    ]);
    expect(queryKeys.assignments.shipments("as_001")).toEqual([
      "assignments",
      "shipments",
      "as_001",
    ]);
  });

  it("produces different keys for different params (no accidental cache collisions)", () => {
    const openKey = queryKeys.shipments.list({ status: "OPEN" });
    const deliveredKey = queryKeys.shipments.list({ status: "DELIVERED" });
    expect(openKey).not.toEqual(deliveredKey);
  });
});
