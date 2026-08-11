import { writeFile } from "node:fs/promises";
import type { ObservationMessageStore } from "@extensions/observations/tracker/types";

/**
 * Writes an observation message store to disk.
 *
 * @param messagesPath Target messages path.
 * @param store Message store payload.
 */
export async function writeObservationMessageStore(
	messagesPath: string,
	store: ObservationMessageStore,
): Promise<void> {
	await writeFile(messagesPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
