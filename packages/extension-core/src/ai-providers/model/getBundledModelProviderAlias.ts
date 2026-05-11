const bundledModelProviderAliases = new Map<string, string>([
  ["minimax-code", "minimax"],
  ["minimax-code-cn", "minimax-cn"],
]);

/**
 * Finds the bundled Pi model provider that backs one Nexus provider id.
 *
 * @param providerId Nexus provider id.
 * @returns Bundled Pi provider id when this provider needs model aliasing.
 */
export function getBundledModelProviderAlias(providerId: string): string | undefined {
  return bundledModelProviderAliases.get(providerId);
}
