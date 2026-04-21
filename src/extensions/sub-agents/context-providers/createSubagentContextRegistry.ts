import type { SubagentContextProvider } from "./types.js";

/**
 * Creates a mutable registry of named subagent context providers.
 *
 * @param initialProviders Providers to seed the registry with.
 * @returns Registry operations.
 */
export function createSubagentContextRegistry(initialProviders: SubagentContextProvider[] = []) {
  const providers = new Map(initialProviders.map((provider) => [provider.id, provider]));

  return {
    /**
     * Registers or replaces one provider.
     *
     * @param provider Provider to register.
     */
    register(provider: SubagentContextProvider): void {
      providers.set(provider.id, provider);
    },
    /**
     * Resolves a provider by id.
     *
     * @param id Provider identifier.
     * @returns Matching provider, if any.
     */
    get(id: string): SubagentContextProvider | undefined {
      return providers.get(id);
    },
    /**
     * Lists all registered providers.
     *
     * @returns Providers in insertion order.
     */
    list(): SubagentContextProvider[] {
      return [...providers.values()];
    },
  };
}
