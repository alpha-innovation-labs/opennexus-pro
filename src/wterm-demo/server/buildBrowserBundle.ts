import { mkdir } from "node:fs/promises";
import esbuild from "esbuild";
import { getBundleOutputDir } from "./getBundleOutputDir.js";

/**
 * Bundles the browser-side wterm client into the local demo output folder.
 */
export async function buildBrowserBundle(): Promise<void> {
  const outdir = getBundleOutputDir();
  await mkdir(outdir, { recursive: true });

  await esbuild.build({
    entryPoints: ["src/wterm-demo/browser/index.ts"],
    bundle: true,
    format: "esm",
    platform: "browser",
    outdir,
    target: ["chrome120"],
    logLevel: "silent",
  });
}
