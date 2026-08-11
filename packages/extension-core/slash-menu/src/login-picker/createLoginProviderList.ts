import { builtinProviders } from "@earendil-works/pi-ai/providers/all";
import type { SlashMenuLeaf } from "../types";

/**
 * Builds left-pane provider list entries from Pi's built-in provider registry.
 *
 * Each provider is rendered as a leaf with kind "provider" and the provider
 * id as its value. The `enabled` flag (from persisted config) determines
 * whether the row is rendered in green (enabled) or default color (disabled).
 *
 * @param providerStates Persisted provider toggle states from config.
 * @returns Provider leaves for the left pane.
 */
export function createLoginProviderList(
  providerStates: Record<string, { enabled: boolean }>,
): SlashMenuLeaf[] {
  const providers = builtinProviders();
  return providers.map((provider) => {
    const enabled = providerStates[provider.id]?.enabled ?? false;
    return {
      kind: "provider" as const,
      label: provider.name,
      description: enabled ? "Enabled" : "Disabled",
      value: provider.id,
      enabled,
    } as SlashMenuLeaf & { enabled: boolean };
  });
}
