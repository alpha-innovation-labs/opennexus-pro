/**
 * Formats a feature-flag extension id as a group label.
 *
 * @param extensionId Extension id from feature flags.
 * @returns Human-readable extension label.
 */
export function formatExtensionIdLabel(extensionId: string): string {
  return extensionId
    .split(/[-_\s]+/u)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "Extension";
}
