import { join } from "node:path";
import { bundleEntryForObfuscation } from "./binary/bundleEntryForObfuscation.mjs";
import { ensureCleanDir } from "./binary/ensureCleanDir.mjs";
import { copyExternalReleasePackages } from "./binary/copyExternalReleasePackages.mjs";
import { getBuildWorkDir } from "./binary/getBuildWorkDir.mjs";
import { getBundleDir } from "./binary/getBundleDir.mjs";
import { getExternalReleasePackages } from "./binary/getExternalReleasePackages.mjs";
import { obfuscateEntryPoint } from "./binary/obfuscateEntryPoint.mjs";
import { patchBundledPiConfig } from "./binary/patchBundledPiConfig.mjs";
import { runBunBuild } from "./binary/runBunBuild.mjs";
import { stageBinaryAssets } from "./binary/stageBinaryAssets.mjs";
import { transpileBundleForObfuscation } from "./binary/transpileBundleForObfuscation.mjs";
import { writeEmbeddedPackageAssetsModule } from "./binary/writeEmbeddedPackageAssetsModule.mjs";
import { getReleaseTargetOptions } from "./binary/getReleaseTargetOptions.mjs";

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
  await writeEmbeddedPackageAssetsModule();

  const bundledEntryPath = await bundleEntryForObfuscation(buildWorkDir);
  await transpileBundleForObfuscation(bundledEntryPath);
  await patchBundledPiConfig(bundledEntryPath);
  const obfuscatedEntryPath = await obfuscateEntryPoint(bundledEntryPath, buildWorkDir);

  const targetOptions = getReleaseTargetOptions();
  await runBunBuild([
    "build",
    "--compile",
    "--minify",
    ...(targetOptions.bunTarget ? ["--target", targetOptions.bunTarget] : []),
    obfuscatedEntryPath,
    "--outfile",
    join(bundleDir, "nexus"),
    ...getExternalReleasePackages().flatMap((packageName) => ["--external", packageName]),
  ]);

  await stageBinaryAssets(bundleDir);
  await copyExternalReleasePackages(bundleDir);
}

await buildBinaryBundle();
