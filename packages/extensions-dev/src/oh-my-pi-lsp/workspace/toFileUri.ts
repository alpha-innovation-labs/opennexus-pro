import * as path from "node:path";

/**
 * Converts a file path to an LSP file URI.
 *
 * @param filePath Absolute or relative file path.
 * @returns Encoded file URI.
 */
export function toFileUri(filePath: string): string {
	const absolutePath = path.resolve(filePath).replace(/\\/g, "/");
	const prefix = absolutePath.startsWith("/") ? "file://" : "file:///";
	return prefix + absolutePath.split("/").map(encodeURIComponent).join("/");
}
