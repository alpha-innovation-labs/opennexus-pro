import { join } from "node:path";
import { bundleEntryForObfuscation } from "./binary/bundleEntryForObfuscation.mjs";
import { ensureCleanDir } from "./binary/ensureCleanDir.mjs";
import { getBuildWorkDir } from "./binary/getBuildWorkDir.mjs";
import { getBundleDir } from "./binary/getBundleDir.mjs";
import { obfuscateEntryPoint } from "./binary/obfuscateEntryPoint.mjs";
import { runBunBuild } from "./binary/runBunBuild.mjs";
import { stageBinaryAssets } from "./binary/stageBinaryAssets.mjs";
import { transpileBundleForObfuscation } from "./binary/transpileBundleForObfuscation.mjs";

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

  const bundledEntryPath = await bundleEntryForObfuscation(buildWorkDir);
  await transpileBundleForObfuscation(bundledEntryPath);
  const obfuscatedEntryPath = await obfuscateEntryPoint(bundledEntryPath, buildWorkDir);

  await runBunBuild([
    "build",
    "--compile",
    "--minify",
    obfuscatedEntryPath,
    "--outfile",
    join(bundleDir, "nexus"),
  ]);

  await stageBinaryAssets(bundleDir);
}

await buildBinaryBundle();
