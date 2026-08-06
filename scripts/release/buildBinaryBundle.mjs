import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { ensureCleanDir } from "./binary/ensureCleanDir.mjs";
import { copyExternalReleasePackages } from "./binary/copyExternalReleasePackages.mjs";
import { getBuildWorkDir } from "./binary/getBuildWorkDir.mjs";
import { getBundleDir } from "./binary/getBundleDir.mjs";
import { getEmbeddedPackageAssetsModulePath } from "./binary/getEmbeddedPackageAssetsModulePath.mjs";
import { getExternalReleasePackages } from "./binary/getExternalReleasePackages.mjs";
import { getReleaseTargetOptions } from "./binary/getReleaseTargetOptions.mjs";
import { runBunBuild } from "./binary/runBunBuild.mjs";
import { stageBinaryAssets } from "./binary/stageBinaryAssets.mjs";
import { writeEmbeddedPackageAssetsModule } from "./binary/writeEmbeddedPackageAssetsModule.mjs";
import { writeReleaseEntrypoint } from "./binary/writeReleaseEntrypoint.mjs";

const bundleDir = getBundleDir();
const buildWorkDir = getBuildWorkDir();

/**
 * Builds the native Nexus bundle and copies its runtime assets.
 *
 * @returns {Promise<void>}
 */
export async function buildBinaryBundle() {
  await ensureCleanDir(bundleDir);
  await ensureCleanDir(buildWorkDir);
  await writeEmbeddedPackageAssetsModule(getEmbeddedPackageAssetsModulePath(buildWorkDir));
  const releaseEntrypointPath = await writeReleaseEntrypoint(buildWorkDir);

  // Copy embedded package assets to workdir so the entry point can resolve it
  const assetContent = await readFile(getEmbeddedPackageAssetsModulePath(buildWorkDir), "utf8");
  await writeFile(join(buildWorkDir, "embeddedPackageAssets.ts"), assetContent, "utf8");

  const targetOptions = getReleaseTargetOptions();
  const externalPackages = getExternalReleasePackages();
  await runBunBuild([
    "build",
    "--compile",
    "--minify",
    ...(targetOptions.bunTarget ? ["--target", targetOptions.bunTarget] : []),
    releaseEntrypointPath,
    "--outfile",
    join(bundleDir, "nexus"),
    ...externalPackages.flatMap((packageName) => ["--external", packageName]),
  ]);

  // Skip patchBundledPiConfig — the launcher sets PI_PACKAGE_DIR, so
  // runtime package-dir resolution is handled by the env var.
  await stageBinaryAssets(bundleDir);
  await copyExternalReleasePackages(bundleDir);
}

await buildBinaryBundle();
