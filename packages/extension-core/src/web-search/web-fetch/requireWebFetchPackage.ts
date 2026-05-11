import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Loads a runtime package from the installed Nexus package or source workspace.
 *
 * @param packageName Package name to require.
 * @returns Loaded CommonJS-compatible package exports.
 */
export function requireWebFetchPackage<T>(packageName: string): T {
	const packageDir = process.env.PI_PACKAGE_DIR;
	const requireFrom = packageDir
		? createRequire(pathToFileURL(join(packageDir, "package.json")).href)
		: createRequire(import.meta.url);
	return requireFrom(packageName) as T;
}
