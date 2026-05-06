import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { getAnnotationConversationsStorePath } from "../paths/getAnnotationConversationsStorePath.js";
import type { AnnotationConversationStore } from "./types.js";

/**
 * Writes the durable annotation conversation store to disk atomically.
 *
 * @param store Conversation store to persist.
 */
export async function writeAnnotationConversationStore(store: AnnotationConversationStore): Promise<void> {
  const path = getAnnotationConversationsStorePath();
  const tmpPath = `${path}.${randomUUID()}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(tmpPath, `${JSON.stringify(store, null, 2)}\n`);
  await rename(tmpPath, path);
}
