import { createHash } from "node:crypto";

/**
 * Creates a filesystem-safe key for a per-line Markdown chat.
 */
export function createLineChatKey(filePath: string, lineNumber: number): string {
	const fileHash = createHash("sha256").update(filePath).digest("hex").slice(0, 16);
	return `${fileHash}-line-${lineNumber}`;
}

/**
 * Creates a content fingerprint used to detect deleted or moved line chats.
 */
export function createLineFingerprint(lines: string[], lineNumber: number): string {
	const index = Math.max(0, lineNumber - 1);
	const nearby = lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2)).join("\n");
	return createHash("sha256").update(`${normalizeLine(lines[index] ?? "")}\n${nearby}`).digest("hex");
}

/**
 * Normalizes Markdown line text for deletion reconciliation.
 */
export function normalizeLine(line: string): string {
	return line.trim().replace(/\s+/g, " ");
}
