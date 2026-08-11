import { homedir } from "node:os";
import { dirname } from "node:path";
import { getConfiguredPackageDir } from "./getConfiguredPackageDir";
import { isBundledBinary } from "./isBundledBinary";

export interface BinaryPackageDirOptions {
	env?: NodeJS.ProcessEnv;
	execPath?: string;
	homeDir?: string;
}

/**
 * Resolves the package asset directory for a compiled Bun binary.
 *
 * @param importMetaUrl Current module URL.
 * @param options Optional process overrides for tests.
 * @returns Package asset directory, or null outside bundled mode.
 */
export function getBinaryPackageDir(
	importMetaUrl: string,
	options: BinaryPackageDirOptions = {},
): string | null {
	const env = options.env ?? process.env;
	const configuredPath = getConfiguredPackageDir(
		env,
		options.homeDir ?? homedir(),
	);
	if (configuredPath) return configuredPath;
	if (!isBundledBinary(importMetaUrl)) return null;
	return dirname(options.execPath ?? process.execPath);
}
