import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

type LinkedomModule = {
	DOMParser: typeof DOMParser;
};

/**
 * Loads LinkeDOM's DOMParser from the installed Nexus package or source workspace.
 *
 * @returns LinkeDOM DOMParser constructor.
 */
export function getLinkedomDOMParser(): typeof DOMParser {
	const packageDir = process.env.PI_PACKAGE_DIR;
	const requireFrom = packageDir
		? createRequire(pathToFileURL(join(packageDir, "package.json")).href)
		: createRequire(import.meta.url);
	return (requireFrom("linkedom") as LinkedomModule).DOMParser;
}
