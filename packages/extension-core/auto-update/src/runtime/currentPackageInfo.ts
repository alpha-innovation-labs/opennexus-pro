import { generatedPackageInfo } from "./packageInfo.generated";

export type CurrentPackageInfo = {
	name: string;
	version: string;
};

/**
 * Returns package metadata generated from the root package.json.
 *
 * @returns Current package name and version baked into the running bundle.
 */
export function currentPackageInfo(): CurrentPackageInfo {
	return {
		name: generatedPackageInfo.name,
		version: process.env.npm_package_version ?? generatedPackageInfo.version,
	};
}
