import { readFile } from "node:fs/promises";
import { getAnnotationConversationsStorePath } from "../paths/getAnnotationConversationsStorePath.js";
import { createEmptyAnnotationConversationStore } from "./createEmptyAnnotationConversationStore.js";
import type { AnnotationConversationStore } from "./types.js";

/**
 * Reads the durable annotation conversation store from disk.
 *
 * @returns Parsed store, or an empty store when absent.
 */
export async function readAnnotationConversationStore(): Promise<AnnotationConversationStore> {
  try {
    return JSON.parse(await readFile(getAnnotationConversationsStorePath(), "utf8")) as AnnotationConversationStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return createEmptyAnnotationConversationStore();
    throw error;
  }
}
