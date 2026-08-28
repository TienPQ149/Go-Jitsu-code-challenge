import fs from "fs";
import path from "path";

/**
 * Minimal JSON-file-backed repository.
 * Loads the whole collection into memory on first access and persists back to disk
 * after every mutation. Fine for a take-home exercise's data volume; not meant for
 * concurrent multi-process access.
 */
export class JsonFileStore<T extends { id: string }> {
  private items: T[] | null = null;

  constructor(private readonly filePath: string) {}

  private load(): T[] {
    if (this.items) return this.items;
    const raw = fs.readFileSync(this.filePath, "utf-8");
    this.items = JSON.parse(raw) as T[];
    return this.items;
  }

  private persist(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.items, null, 2), "utf-8");
  }

  findAll(): T[] {
    return this.load();
  }

  findById(id: string): T | undefined {
    return this.load().find((item) => item.id === id);
  }

  insert(item: T): T {
    const items = this.load();
    items.push(item);
    this.persist();
    return item;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const items = this.load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...patch };
    this.persist();
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    this.persist();
    return true;
  }
}

export function dataFilePath(fileName: string): string {
  return path.join(__dirname, "..", "..", "data", fileName);
}
