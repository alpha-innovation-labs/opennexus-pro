import { normalizeInstallSource } from "../install/normalizeInstallSource.js";

/**
 * Normalizes user-friendly uninstall inputs into Pi package-manager sources.
 *
 * @param source Raw source provided to nexus uninstall.
 * @returns Normalized package-manager source.
 */
export function normalizeUninstallSource(source: string): string {
  return normalizeInstallSource(source);
}
