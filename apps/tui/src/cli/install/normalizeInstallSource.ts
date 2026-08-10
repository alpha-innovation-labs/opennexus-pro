import { getPiPackageNameFromUrl } from "./getPiPackageNameFromUrl";
import { isLikelyNpmPackageName } from "./isLikelyNpmPackageName";

/**
 * Normalizes user-friendly install inputs into Pi package-manager sources.
 *
 * @param source Raw source provided to nexus install.
 * @returns Normalized package-manager source.
 */
export function normalizeInstallSource(source: string): string {
  const trimmed = source.trim();
  const piPackageName = getPiPackageNameFromUrl(trimmed);
  if (piPackageName) return `npm:${piPackageName}`;
  if (trimmed.startsWith("npm:") || trimmed.startsWith("git:")) return trimmed;
  if (/^https?:\/\//iu.test(trimmed) || /^ssh:\/\//iu.test(trimmed)) return trimmed;
  if (trimmed.startsWith(".") || trimmed.startsWith("/") || trimmed.startsWith("~")) return trimmed;
  if (isLikelyNpmPackageName(trimmed)) return `npm:${trimmed}`;
  return trimmed;
}
