import { readFile } from "node:fs/promises";
import { getAnnotationsStorePath } from "../paths/getAnnotationsStorePath.js";
import { createEmptyAnnotationStore } from "./createEmptyAnnotationStore.js";
import type { AnnotationStore } from "./types.js";

/**
 * Reads the durable annotations store from disk.
 *
 * @returns Parsed annotation store, or an empty store when absent.
 */
export async function readAnnotationStore(): Promise<AnnotationStore> {
  try {
    return JSON.parse(await readFile(getAnnotationsStorePath(), "utf8")) as AnnotationStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyAnnotationStore();
    }
    throw error;
  }
}
