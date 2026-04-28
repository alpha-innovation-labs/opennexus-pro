import { resolve } from "node:path";
import { resolvePublicPath } from "./resolve-public-path.js";

export type ResolveAssetPathOptions = {
  readonly publicDir: string;
  readonly stylesDir: string;
};

/**
 * Resolves a request URL to either a public asset or source stylesheet path.
 *
 * @param options Static asset directory options.
 * @param requestUrl Raw HTTP request URL.
 * @returns Absolute asset path, or null for unsafe paths.
 */
export function resolveAssetPath(options: ResolveAssetPathOptions, requestUrl: string): string | null {
  const pathname = new URL(requestUrl, "http://localhost").pathname;

  if (pathname.startsWith("/styles/")) {
    const stylePath = resolve(options.stylesDir, decodeURIComponent(pathname.replace("/styles/", "")));
    return stylePath.startsWith(options.stylesDir) ? stylePath : null;
  }

  return resolvePublicPath(options.publicDir, requestUrl);
}
