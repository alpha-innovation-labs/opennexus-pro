import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getBinaryPackageDir } from "@nexus/runtime/package/getBinaryPackageDir";

/**
 * Reads the packaged Nexus version from the adjacent package.json file.
 *
 * @returns The packaged app version.
 */
export async function readCliPackageVersion(): Promise<string> {
  const binaryPackageDir = getBinaryPackageDir(import.meta.url, {
    execPath: process.argv0 || process.execPath,
  });
  const currentDirPath = dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = binaryPackageDir
    ? join(binaryPackageDir, "package.json")
    : resolve(currentDirPath, "../../../../../package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  return String(packageJson.version ?? "0.1.0");
}
