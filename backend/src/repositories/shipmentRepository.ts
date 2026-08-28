import { Shipment } from "../types/domain";
import { dataFilePath, JsonFileStore } from "./JsonFileStore";

export const shipmentStore = new JsonFileStore<Shipment>(dataFilePath("shipments.json"));
