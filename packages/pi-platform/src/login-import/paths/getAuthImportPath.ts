import type { AuthImportSource } from "../model/AuthImportSource.js";
import { getOpenCodeAuthImportPath } from "./getOpenCodeAuthImportPath.js";
import { getPiAuthImportPath } from "./getPiAuthImportPath.js";

/**
 * Resolves the auth file path for a supported import source.
 *
 * @param source Import source identifier.
 * @returns Absolute auth.json path for the source.
 */
export function getAuthImportPath(source: AuthImportSource): string {
	return source === "pi" ? getPiAuthImportPath() : getOpenCodeAuthImportPath();
}
