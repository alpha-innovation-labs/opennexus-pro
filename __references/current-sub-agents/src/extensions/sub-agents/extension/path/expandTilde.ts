import * as os from "node:os";
import * as path from "node:path";

/**
 * Expands a leading home-directory shorthand.
 *
 * @param value Input path value.
 * @returns Expanded path string.
 */
export function expandTilde(value: string): string {
	return value.startsWith("~/") ? path.join(os.homedir(), value.slice(2)) : value;
}
