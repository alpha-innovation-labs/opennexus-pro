import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getAnnotationsStorePath } from "../paths/getAnnotationsStorePath.js";
import type { AnnotationStore } from "./types.js";

/**
 * Writes the durable annotations store to disk.
 *
 * @param store Store document to persist.
 */
export async function writeAnnotationStore(store: AnnotationStore): Promise<void> {
  const storePath = getAnnotationsStorePath();
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
