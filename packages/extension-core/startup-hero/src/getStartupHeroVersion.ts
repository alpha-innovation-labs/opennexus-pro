import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getBinaryPackageDir } from "@nexus/runtime/package/getBinaryPackageDir";

/**
 * Reads the Nexus package version for the startup hero.
 *
 * @returns Nexus package version, or unknown when package metadata cannot be read.
 */
export function getStartupHeroVersion(): string {
	const envVersion = process.env.npm_package_version;
	if (envVersion) return envVersion;

	try {
		const binaryPackageDir = getBinaryPackageDir(import.meta.url, { execPath: process.argv0 || process.execPath });
		const currentDirPath = dirname(fileURLToPath(import.meta.url));
		const packageJsonPath = binaryPackageDir ? join(binaryPackageDir, "package.json") : resolve(currentDirPath, "../../../../package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
		return String(packageJson.version ?? "unknown");
	} catch {
		return "unknown";
	}
}
