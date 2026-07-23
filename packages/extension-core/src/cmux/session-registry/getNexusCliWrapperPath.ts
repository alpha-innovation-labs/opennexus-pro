import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Resolves the npm package wrapper that prepares Nexus runtime asset environment.
 *
 * @param env Process environment to inspect.
 * @returns Absolute wrapper path when available.
 */
export function getNexusCliWrapperPath(env: NodeJS.ProcessEnv = process.env): string | undefined {
	const packageDir = env.PI_PACKAGE_DIR?.trim();
	if (!packageDir) return undefined;
	const wrapperPath = join(packageDir, "bin", "nexus");
	return existsSync(wrapperPath) ? wrapperPath : undefined;
}
