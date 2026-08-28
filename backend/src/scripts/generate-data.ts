import fs from "fs";
import path from "path";
import { Assignment, Shipment, ShipmentStatus } from "../types/domain";

/**
 * Generates sample data consistent with the exercise spec, but goes one step
 * further than the provided `generated-data.js`: it also creates Assignment
 * records and wires up `assignment_id` / `shipment_count` / `clients`
 * correctly so the two collections are relationally consistent.
 */

const STATUS_LIST: ShipmentStatus[] = ["OPEN", "IN_TRANSIT", "DELIVERED"];
const CLIENTS = ["Sony", "Samsung", "DHL", "CargoTrans", "ShipCo", "Logix", "Oceanic"];
const WAREHOUSES = ["EWR", "LAX", "JFK", "SFO", "SEA"];

const MIN_LAT = 32.55;
const MAX_LAT = 33.05;
const MIN_LNG = -97.4;
const MAX_LNG = -96.5;

const SHIPMENT_COUNT = 100;
const ASSIGNMENT_COUNT = 20;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function buildAssignments(): Assignment[] {
  const assignments: Assignment[] = [];
  for (let i = 1; i <= ASSIGNMENT_COUNT; i++) {
    assignments.push({
      id: `as_${String(i).padStart(3, "0")}`,
      label: `${WAREHOUSES[i % WAREHOUSES.length]}-${100 + i}`,
      status: i % 5 === 0 ? "COMPLETED" : "OPEN",
      clients: [],
      shipment_count: 0,
    });
  }
  return assignments;
}

function buildShipments(assignments: Assignment[]): Shipment[] {
  const baseDate = new Date();
  const shipments: Shipment[] = [];

  for (let i = 1; i <= SHIPMENT_COUNT; i++) {
    const arrival = new Date(baseDate);
    arrival.setDate(arrival.getDate() - Math.floor(Math.random() * 10));

    const eta = new Date(arrival);
    eta.setHours(eta.getHours() + Math.floor(Math.random() * 48));

    const status = STATUS_LIST[i % STATUS_LIST.length];
    const clientName = CLIENTS[i % CLIENTS.length];

    // Only IN_TRANSIT / DELIVERED shipments belong to an assignment, matching the domain rules.
    let assignmentId: string | null = null;
    if (status !== "OPEN") {
      const assignment = assignments[i % assignments.length];
      assignmentId = assignment.id;
    }

    shipments.push({
      id: `shp_${String(i).padStart(3, "0")}`,
      client_name: clientName,
      label: `${WAREHOUSES[i % WAREHOUSES.length]}-581-2505${20 + (i % 10)}-${i}`,
      status,
      arrival_date: arrival.toISOString(),
      delivery_by_date: new Date(arrival.getTime() + 2 * 86400000).toISOString(),
      eta: eta.toISOString(),
      warehouse_id: "581",
      assignment_id: assignmentId,
      lat: randomBetween(MIN_LAT, MAX_LAT),
      lng: randomBetween(MIN_LNG, MAX_LNG),
    });
  }

  return shipments;
}

function syncAssignments(assignments: Assignment[], shipments: Shipment[]): Assignment[] {
  return assignments.map((assignment) => {
    const shipmentsInAssignment = shipments.filter(
      (s) => s.assignment_id === assignment.id
    );
    const clients = Array.from(
      new Set(shipmentsInAssignment.map((s) => s.client_name))
    );
    return {
      ...assignment,
      shipment_count: shipmentsInAssignment.length,
      clients,
    };
  });
}

function main() {
  const assignmentsSeed = buildAssignments();
  const shipments = buildShipments(assignmentsSeed);
  const assignments = syncAssignments(assignmentsSeed, shipments);

  const dataDir = path.join(__dirname, "..", "..", "data");
  fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(
    path.join(dataDir, "shipments.json"),
    JSON.stringify(shipments, null, 2)
  );
  fs.writeFileSync(
    path.join(dataDir, "assignments.json"),
    JSON.stringify(assignments, null, 2)
  );

  console.log(
    `Generated ${shipments.length} shipments and ${assignments.length} assignments in ${dataDir}`
  );
}

main();
