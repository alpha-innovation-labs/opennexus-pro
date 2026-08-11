import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Loads a runtime package from the extension's own node_modules.
 *
 * Resolves packages relative to this extension's package.json,
 * making it work for both standalone npm-installed extensions
 * and bundled extensions loaded by the Pi runner.
 *
 * @param packageName Package name to require.
 * @returns Loaded CommonJS-compatible package exports.
 */
export function requirePackage<T>(packageName: string): T {
	const requireFrom = createRequire(join(__dirname, "..", "package.json"));
	return requireFrom(packageName) as T;
}
