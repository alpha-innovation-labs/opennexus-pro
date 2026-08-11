import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	type BinaryPackageDirOptions,
	getBinaryPackageDir,
} from "./getBinaryPackageDir";

/**
 * Resolves a package asset path in source mode and compiled-binary mode.
 *
 * @param importMetaUrl Current module URL.
 * @param packageRelativePath Asset path relative to the installed package dir.
 * @param sourceRelativeUrl Asset URL relative to the current module in source mode.
 * @param options Optional process overrides for tests.
 * @returns Absolute asset path.
 */
export function resolveBundledAssetPath(
	importMetaUrl: string,
	packageRelativePath: string,
	sourceRelativeUrl: string,
	options: BinaryPackageDirOptions = {},
): string {
	const packageDir = getBinaryPackageDir(importMetaUrl, options);
	if (packageDir) return join(packageDir, packageRelativePath);
	return fileURLToPath(new URL(sourceRelativeUrl, importMetaUrl));
}
