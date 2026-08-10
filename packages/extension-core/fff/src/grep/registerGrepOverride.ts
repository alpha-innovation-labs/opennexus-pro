import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createGrepTool } from "@earendil-works/pi-coding-agent";
import { loadFeatureState } from "../features/loadFeatureState";
import { getRuntimeForCwd } from "../runtime/runtimeStore";
import { buildGrepFailureMessage } from "./buildGrepFailureMessage";
import { createGrepSchema } from "./createGrepSchema";
import { normalizeGrepMode } from "./normalizeGrepMode";
import { shouldFallbackToBuiltinGrep } from "./shouldFallbackToBuiltinGrep";

/**
 * Registers the bundled FFF override for the built-in `grep` tool.
 *
 * @param pi Pi extension API.
 */
export function registerGrepOverride(pi: ExtensionAPI): void {
  const template = createGrepTool(process.cwd());

  pi.registerTool({
    name: "grep",
    label: "grep",
    description: `${template.description} Uses FFF-backed indexed search when compatible.`,
    promptSnippet: (template as { promptSnippet?: string }).promptSnippet,
    promptGuidelines: (template as { promptGuidelines?: string[] }).promptGuidelines,
    parameters: createGrepSchema(),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const original = createGrepTool(ctx.cwd);
      const builtinParams = {
        pattern: params.pattern,
        path: params.path,
        glob: params.glob,
        ignoreCase: params.ignoreCase,
        literal: params.literal,
        context: params.context,
        limit: params.limit,
      };
      const enabledFeatures = await loadFeatureState();
      if (!enabledFeatures.has("grepOverride") || shouldFallbackToBuiltinGrep(builtinParams)) {
        return original.execute(toolCallId, builtinParams, signal, onUpdate);
      }

      const runtime = getRuntimeForCwd(ctx.cwd);
      if (!runtime) {
        return original.execute(toolCallId, builtinParams, signal, onUpdate);
      }

      try {
        const result = await runtime.grepSearch({
          pattern: params.ignoreCase ? params.pattern.toLowerCase() : params.pattern,
          mode: normalizeGrepMode(params.mode, params.literal),
          pathQuery: params.path,
          glob: params.glob,
          context: params.context,
          limit: params.limit,
          cursor: params.cursor,
        });
        return {
          content: [{ type: "text" as const, text: result.formatted }],
          details: {
            nextCursor: result.nextCursor ?? null,
            resolvedScope: result.scope?.relativePath ?? null,
            constraintQuery: result.constraintQuery ?? null,
          },
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: buildGrepFailureMessage(error) }],
          details: { error: error instanceof Error ? error.message : String(error) },
        };
      }
    },
  });
}
