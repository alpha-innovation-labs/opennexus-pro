import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";

export type MarkdownFileSnapshot = {
	filePath: string;
	content: string;
	lines: string[];
	mtimeMs: number;
	contentHash: string;
};

/**
 * Builds a stable file snapshot used for rendering, persistence, and context refresh checks.
 */
export async function computeMarkdownFileSnapshot(filePath: string, content: string): Promise<MarkdownFileSnapshot> {
	const fileStat = await stat(filePath);
	return {
		filePath,
		content,
		lines: content.length === 0 ? [""] : content.split(/\r?\n/),
		mtimeMs: fileStat.mtimeMs,
		contentHash: createHash("sha256").update(content).digest("hex"),
	};
}
