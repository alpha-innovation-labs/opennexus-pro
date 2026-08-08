import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveBundledAssetPath } from "@nexus/runtime/package/resolveBundledAssetPath.js";
import { embeddedPackageAssetsGlobalKey } from "@nexus/runtime/package/embedded-assets/embeddedPackageAssetsGlobal.js";

/**
 * Reads the bundled system prompt from embedded package assets when available
 * (compiled binary release mode), or falls back to reading from the filesystem
 * (source/dev mode).
 */
function readSystemPrompt(): string {
  const globalAssets = (globalThis as Record<string, unknown>)[embeddedPackageAssetsGlobalKey] as
    | { embeddedPackageAssets: { path: string; contentBase64: string }[] }
    | undefined;

  if (globalAssets?.embeddedPackageAssets) {
    const asset = globalAssets.embeddedPackageAssets.find(
      (a) => a.path === "prompts/base-system-prompt/system_prompt.md",
    );
    if (asset) {
      return Buffer.from(asset.contentBase64, "base64").toString("utf-8").trimEnd();
    }
  }

  // Source mode: read from filesystem
  return readFileSync(
    resolveBundledAssetPath(
      import.meta.url,
      "prompts/base-system-prompt/system_prompt.md",
      "./system_prompt.md",
    ),
    "utf-8",
  ).trimEnd();
}

/**
 * Bundled Nexus base system prompt read from system_prompt.md.
 */
export const baseSystemPrompt = readSystemPrompt();
