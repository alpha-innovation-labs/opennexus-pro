import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isBundledBinary } from "../isBundledBinary";
import { ensureEmbeddedPackageDir } from "./ensureEmbeddedPackageDir";

/**
 * Detects whether the current module runs from a tsdown-bundled binary.
 *
 * @param importMetaUrl Current module URL.
 * @returns True when the URL points inside a tsdown build output.
 */
function isTsdownBundledBinary(importMetaUrl: string): boolean {
	try {
		const urlPath = fileURLToPath(importMetaUrl);
		return urlPath.includes("/build/") || urlPath.includes("/dist/");
	}
	catch {
		return false;
	}
}

/**
 * Ensures bundled-binary package assets are available and exported via env.
 *
 * @returns Absolute package directory when configured.
 */
export async function ensureEmbeddedPackageDirEnv(): Promise<
	string | undefined
> {
	if (process.env.PI_PACKAGE_DIR) {
		return process.env.PI_PACKAGE_DIR;
	}

	// Bun-compiled binary: extract assets to agent dir.
	if (isBundledBinary(import.meta.url)) {
		const packageDir = await ensureEmbeddedPackageDir();
		process.env.PI_PACKAGE_DIR = packageDir;
		return packageDir;
	}

	// tsdown-bundled binary: point PI_PACKAGE_DIR at the build directory
	// so that bundled packages (e.g. @earendil-works/pi-coding-agent) can
	// resolve their bundled assets relative to the build output.
	if (isTsdownBundledBinary(import.meta.url)) {
		const buildDir = join(fileURLToPath(import.meta.url), "..");
		process.env.PI_PACKAGE_DIR = buildDir;
		return buildDir;
	}

	return undefined;
}
