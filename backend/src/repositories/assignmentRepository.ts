import { Assignment } from "../types/domain";
import { dataFilePath, JsonFileStore } from "./JsonFileStore";

export const assignmentStore = new JsonFileStore<Assignment>(dataFilePath("assignments.json"));
