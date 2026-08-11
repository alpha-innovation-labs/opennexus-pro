import { writeFile } from "node:fs/promises";
import { withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import { renderObservationsMarkdown } from "./renderObservationsMarkdown";
import type { ObservationState } from "./types";

/**
 * Writes the rendered observations markdown file.
 *
 * @param markdownPath Observations markdown path.
 * @param state Observation state.
 */
export async function writeObservationsMarkdown(
	markdownPath: string,
	state: ObservationState,
): Promise<void> {
	const content = `${renderObservationsMarkdown(state).trimEnd()}\n`;
	await withFileMutationQueue(markdownPath, async () => {
		await writeFile(markdownPath, content, "utf8");
	});
}
