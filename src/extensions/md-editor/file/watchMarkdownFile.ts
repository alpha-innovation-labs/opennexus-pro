import { watch, type FSWatcher } from "node:fs";
import { readFile } from "node:fs/promises";
import { computeMarkdownFileSnapshot, type MarkdownFileSnapshot } from "./computeMarkdownFileSnapshot.js";

/**
 * Watches one Markdown file and reports fresh snapshots after on-disk changes.
 */
export function watchMarkdownFile(filePath: string, onChange: (snapshot: MarkdownFileSnapshot) => void): FSWatcher {
	let timer: NodeJS.Timeout | undefined;
	return watch(filePath, () => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			void readFile(filePath, "utf8")
				.then((content) => computeMarkdownFileSnapshot(filePath, content))
				.then(onChange)
				.catch(() => undefined);
		}, 30);
	});
}
