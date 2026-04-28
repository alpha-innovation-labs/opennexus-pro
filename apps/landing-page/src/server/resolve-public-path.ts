import { resolve } from "node:path";

/**
 * Resolves a request URL to a project-local public asset path.
 *
 * @param publicDir Directory containing public assets.
 * @param requestUrl Raw HTTP request URL.
 * @returns Absolute path inside the public directory, or null for unsafe paths.
 */
export function resolvePublicPath(publicDir: string, requestUrl: string): string | null {
  const pathname = new URL(requestUrl, "http://localhost").pathname;
  const decodedPath = decodeURIComponent(pathname);
  const assetPath = resolve(publicDir, decodedPath.slice(1));

  if (!assetPath.startsWith(publicDir)) {
    return null;
  }

  return assetPath;
}
