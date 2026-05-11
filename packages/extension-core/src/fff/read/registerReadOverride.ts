import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createReadTool } from "@earendil-works/pi-coding-agent";
import { loadFeatureState } from "../features/loadFeatureState.js";
import { buildReadFailureMessage } from "./buildReadFailureMessage.js";
import { locationToReadParams } from "./locationToReadParams.js";
import { getRuntimeForCwd } from "../runtime/runtimeStore.js";

/**
 * Registers the bundled FFF override for the built-in `read` tool.
 *
 * @param pi Pi extension API.
 */
export function registerReadOverride(pi: ExtensionAPI): void {
  pi.registerTool({
    ...createReadTool(process.cwd()),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const original = createReadTool(ctx.cwd);
      const enabledFeatures = await loadFeatureState();
      if (!enabledFeatures.has("readOverride")) {
        return original.execute(toolCallId, params, signal, onUpdate);
      }

      const runtime = getRuntimeForCwd(ctx.cwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate);
      }

      try {
        const resolved = await runtime.resolvePath(params.path, false);
        void runtime.trackQuery(params.path, resolved.absolutePath);
        const readParams = locationToReadParams(resolved, params.offset, params.limit);
        return original.execute(
          toolCallId,
          { ...params, path: resolved.absolutePath, offset: readParams.offset, limit: readParams.limit },
          signal,
          onUpdate,
        );
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: buildReadFailureMessage("read", params.path, error) }],
          details: { error: error instanceof Error ? error.message : String(error) },
        };
      }
    },
  });
}
