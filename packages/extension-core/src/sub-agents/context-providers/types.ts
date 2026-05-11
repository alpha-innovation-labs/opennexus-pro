import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/**
 * Input passed to one subagent context provider.
 */
export type SubagentContextProviderInput = {
  ctx: ExtensionContext;
};

/**
 * One named provider of prompt context for a child subagent.
 */
export type SubagentContextProvider = {
  id: string;
  provide(input: SubagentContextProviderInput): Promise<string>;
};
