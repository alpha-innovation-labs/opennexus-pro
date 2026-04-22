import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Reads the root package metadata used to build the release npm wrapper.
 *
 * @returns {Promise<{ version: string, dependencies: Record<string, string> }>}
 */
export async function readRootPackageMetadata() {
  const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
  return {
    version: String(packageJson.version ?? "0.1.0"),
    dependencies: Object.fromEntries(
      Object.entries(packageJson.dependencies ?? {}).map(([name, version]) => [name, String(version)]),
    ),
  };
}
