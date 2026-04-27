import { detectLinuxLibcKind } from "./detectLinuxLibcKind.mjs";

/**
 * Resolves the ffi-rs native package name for one platform tuple.
 *
 * @param {{ platform?: NodeJS.Platform, arch?: string, libc?: "gnu" | "musl" }} options Platform options.
 * @returns {string} Platform-specific @yuuang package name.
 */
export function getFfiRsPlatformPackageName(options = {}) {
  const platform = options.platform ?? process.platform;
  const arch = options.arch ?? process.arch;
  const libc = options.libc ?? (platform === "linux" ? detectLinuxLibcKind() : undefined);

  if (platform === "darwin" && arch === "arm64") return "@yuuang/ffi-rs-darwin-arm64";
  if (platform === "darwin" && arch === "x64") return "@yuuang/ffi-rs-darwin-x64";
  if (platform === "linux" && arch === "arm64") return `@yuuang/ffi-rs-linux-arm64-${libc}`;
  if (platform === "linux" && arch === "x64") return `@yuuang/ffi-rs-linux-x64-${libc}`;
  if (platform === "linux" && arch === "arm") return "@yuuang/ffi-rs-linux-arm-gnueabihf";
  if (platform === "win32" && arch === "arm64") return "@yuuang/ffi-rs-win32-arm64-msvc";
  if (platform === "win32" && arch === "x64") return "@yuuang/ffi-rs-win32-x64-msvc";
  if (platform === "win32" && arch === "ia32") return "@yuuang/ffi-rs-win32-ia32-msvc";

  throw new Error(`Unsupported ffi-rs platform: ${platform}/${arch}${libc ? `/${libc}` : ""}`);
}
