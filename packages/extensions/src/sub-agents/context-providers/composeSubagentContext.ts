import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { SubagentContextProvider } from "./types.js";

/**
 * Composes ordered prompt context blocks from selected providers.
 *
 * @param ctx Extension runtime context.
 * @param providers Providers to invoke.
 * @returns Concatenated non-empty context blocks.
 */
export async function composeSubagentContext(
  ctx: ExtensionContext,
  providers: SubagentContextProvider[],
): Promise<string> {
  const blocks = await Promise.all(providers.map((provider) => provider.provide({ ctx })));
  return blocks.map((block) => block.trim()).filter(Boolean).join("\n\n---\n\n");
}
