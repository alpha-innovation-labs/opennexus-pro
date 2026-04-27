import { detectLinuxLibcKind } from "./detectLinuxLibcKind.mjs";

/**
 * Resolves the FFF native package name for one platform tuple.
 *
 * @param {{ platform?: NodeJS.Platform, arch?: string, libc?: "gnu" | "musl" }} options Platform options.
 * @returns {string} Platform-specific @ff-labs package name.
 */
export function getFffPlatformPackageName(options = {}) {
  const platform = options.platform ?? process.platform;
  const arch = options.arch ?? process.arch;
  const libc = options.libc ?? (platform === "linux" ? detectLinuxLibcKind() : undefined);

  if (platform === "darwin" && arch === "arm64") return "@ff-labs/fff-bin-darwin-arm64";
  if (platform === "darwin" && arch === "x64") return "@ff-labs/fff-bin-darwin-x64";
  if (platform === "linux" && arch === "arm64") return `@ff-labs/fff-bin-linux-arm64-${libc}`;
  if (platform === "linux" && arch === "x64") return `@ff-labs/fff-bin-linux-x64-${libc}`;
  if (platform === "win32" && arch === "arm64") return "@ff-labs/fff-bin-win32-arm64";
  if (platform === "win32" && arch === "x64") return "@ff-labs/fff-bin-win32-x64";

  throw new Error(`Unsupported FFF platform: ${platform}/${arch}${libc ? `/${libc}` : ""}`);
}
