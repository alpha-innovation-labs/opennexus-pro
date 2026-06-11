import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { copyPath } from "../binary/copyPath.mjs";
import { getBundleDir } from "../binary/getBundleDir.mjs";
import { ensureCleanDir } from "../binary/ensureCleanDir.mjs";
import { getReleaseNpmPackageDir } from "./getReleaseNpmPackageDir.mjs";
import { readRootPackageMetadata } from "./readRootPackageMetadata.mjs";
import { createPortablePostinstallScript } from "./createPortablePostinstallScript.mjs";
import { getReleasePackagePlatformFields } from "./getReleasePackagePlatformFields.mjs";
import { getReleasePackageDependencies } from "./getReleasePackageDependencies.mjs";

/**
 * Creates the temporary npm package that installs the binary-only Nexus release.
 *
 * @param {string} packageDir Output npm package directory.
 * @returns {Promise<void>}
 */
export async function createReleaseNpmPackage(packageDir = getReleaseNpmPackageDir()) {
  const { version, dependencies } = await readRootPackageMetadata();
  const { os, cpu } = getReleasePackagePlatformFields();
  const releaseDependencies = getReleasePackageDependencies(dependencies);
  const bundleDir = getBundleDir();
  await ensureCleanDir(packageDir);
  await mkdir(join(packageDir, "bin"), { recursive: true });

  await copyPath(join(bundleDir, "nexus"), join(packageDir, "nexus"));
  for (const assetName of ["assets", "commands", "export-html", "runtime", "theme"]) {
    await copyPath(join(bundleDir, "package", assetName), join(packageDir, assetName));
  }

  const postinstall = createPortablePostinstallScript();

  await writeFile(
    join(packageDir, "package.json"),
    `${JSON.stringify({
      name: "opennexus",
      version,
      piConfig: {
        name: "nexus",
        configDir: ".local/share/nexus",
      },
      publishConfig: {
        registry: "https://registry.npmjs.org/",
        access: "public",
      },
      scripts: {
        postinstall,
      },
      bin: {
        nexus: "bin/nexus",
        opennexus: "bin/nexus",
      },
      dependencies: releaseDependencies,
      files: ["bin", "nexus", "assets", "commands", "export-html", "runtime", "theme", "package.json"],
      os,
      cpu,
    }, null, 2)}\n`,
    "utf8",
  );

  const launcherPath = join(packageDir, "bin", "nexus");
  await writeFile(
    launcherPath,
    [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      "",
      "SCRIPT_PATH=\"$(perl -MCwd=realpath -e 'print realpath(shift)' \"$0\")\"",
      'BIN_DIR="$(cd "$(dirname "${SCRIPT_PATH}")" && pwd)"',
      'PACKAGE_DIR="$(cd "${BIN_DIR}/.." && pwd)"',
      'export PI_PACKAGE_DIR="${PACKAGE_DIR}"',
      'exec "${PACKAGE_DIR}/nexus" "$@"',
      "",
    ].join("\n"),
    "utf8",
  );
  await chmod(join(packageDir, "nexus"), 0o755);
  await chmod(launcherPath, 0o755);
}

await createReleaseNpmPackage();
