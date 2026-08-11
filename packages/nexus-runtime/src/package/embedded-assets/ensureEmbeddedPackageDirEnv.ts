import { isBundledBinary } from "../isBundledBinary";
import { ensureEmbeddedPackageDir } from "./ensureEmbeddedPackageDir";

/**
 * Ensures bundled-binary package assets are available and exported via env.
 *
 * @returns Absolute package directory when configured.
 */
export async function ensureEmbeddedPackageDirEnv(): Promise<
	string | undefined
> {
	if (process.env.PI_PACKAGE_DIR || !isBundledBinary(import.meta.url)) {
		return process.env.PI_PACKAGE_DIR;
	}

	const packageDir = await ensureEmbeddedPackageDir();
	process.env.PI_PACKAGE_DIR = packageDir;
	return packageDir;
}
