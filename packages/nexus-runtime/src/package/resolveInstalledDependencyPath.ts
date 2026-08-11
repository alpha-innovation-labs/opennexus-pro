import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves one dependency entry from the installed package when available.
 *
 * @param importMetaUrl Current module URL.
 * @param dependencyRelativePath Dependency entry path relative to node_modules.
 * @param sourceRelativeUrl Source-mode fallback URL relative to the current module.
 * @returns Absolute dependency entry path.
 */
export function resolveInstalledDependencyPath(
	importMetaUrl: string,
	dependencyRelativePath: string,
	sourceRelativeUrl: string,
): string {
	if (process.env.PI_PACKAGE_DIR) {
		return join(
			process.env.PI_PACKAGE_DIR,
			"node_modules",
			dependencyRelativePath,
		);
	}

	return fileURLToPath(new URL(sourceRelativeUrl, importMetaUrl));
}
