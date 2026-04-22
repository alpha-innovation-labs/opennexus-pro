import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { copyPath } from "../binary/copyPath.mjs";
import { getBundleDir } from "../binary/getBundleDir.mjs";
import { ensureCleanDir } from "../binary/ensureCleanDir.mjs";
import { getReleaseNpmPackageDir } from "./getReleaseNpmPackageDir.mjs";
import { readRootPackageMetadata } from "./readRootPackageMetadata.mjs";

/**
 * Creates the temporary npm package that installs the binary-only Nexus release.
 *
 * @param {string} packageDir Output npm package directory.
 * @returns {Promise<void>}
 */
export async function createReleaseNpmPackage(packageDir = getReleaseNpmPackageDir()) {
  const { version, dependencies } = await readRootPackageMetadata();
  const bundleDir = getBundleDir();
  await ensureCleanDir(packageDir);
  await mkdir(join(packageDir, "bin"), { recursive: true });

  await copyPath(join(bundleDir, "nexus"), join(packageDir, "nexus"));
  for (const assetName of ["assets", "commands", "export-html", "runtime", "theme"]) {
    await copyPath(join(bundleDir, "package", assetName), join(packageDir, assetName));
  }

  const postinstall = `node -e "const fs=require('fs');const path=require('path');const src=path.join(process.cwd(),'node_modules','@yuuang','ffi-rs-darwin-arm64','ffi-rs.darwin-arm64.node');const dst=path.join(process.cwd(),'node_modules','ffi-rs','ffi-rs.darwin-arm64.node');if(fs.existsSync(src)){fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);}"`;

  await writeFile(
    join(packageDir, "package.json"),
    `${JSON.stringify({
      name: "opennexus",
      version,
      piConfig: {
        name: "nexus",
        configDir: ".nexus",
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
      dependencies: {
        "@ff-labs/fff-node": dependencies["@ff-labs/fff-node"],
      },
      files: ["bin", "nexus", "assets", "commands", "export-html", "runtime", "theme", "package.json"],
      os: ["darwin"],
      cpu: ["arm64"],
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
