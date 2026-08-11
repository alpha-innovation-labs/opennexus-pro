import { fileURLToPath } from "node:url";

/**
 * Resolves the source-mode Nexus entrypoint path.
 *
 * @returns Absolute source entrypoint path.
 */
export function getSourceEntrypointPath(): string {
	return fileURLToPath(
		new URL("../../../../apps/tui/src/index.ts", import.meta.url),
	);
}
