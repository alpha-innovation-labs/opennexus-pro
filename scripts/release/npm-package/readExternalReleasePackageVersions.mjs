import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getExternalReleasePackages } from "../binary/getExternalReleasePackages.mjs";

/**
 * Reads versions for external runtime packages shipped with the release.
 *
 * @returns {Promise<Record<string, string>>} Package version map.
 */
export async function readExternalReleasePackageVersions() {
  const entries = await Promise.all(
    getExternalReleasePackages().map(async (packageName) => {
      const packageJson = JSON.parse(
        await readFile(resolve("node_modules", ...packageName.split("/"), "package.json"), "utf8"),
      );

      return [packageName, String(packageJson.version ?? "*")];
    }),
  );

  return Object.fromEntries(entries);
}
