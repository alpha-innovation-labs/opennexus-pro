import { createLsTool } from "@mariozechner/pi-coding-agent";
import { getRtkExecutionCwd } from "../runtime/getRtkExecutionCwd.js";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore.js";
import { resolveRtkPath } from "../runtime/resolveRtkPath.js";

/**
 * Creates the RTK-backed ls tool.
 *
 * @returns RTK-aware ls tool definition.
 */
export function createRtkLsTool() {
  const template = createLsTool(process.cwd());

  return {
    ...template,
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const cwd = getRtkExecutionCwd(ctx);
      const original = createLsTool(cwd);
      const runtime = getRtkRuntimeForCwd(cwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }

      const input = params as { path?: string; limit?: number };

      try {
        const dirPath = resolveRtkPath(cwd, input.path ?? ".");
        const effectiveLimit = Math.max(1, input.limit ?? 500);
        const result = await runtime.exec("ls", [dirPath], { cwd, signal });

        if (result.code !== 0 && result.stdout.trim().length === 0) {
          return original.execute(toolCallId, params, signal, onUpdate, ctx);
        }

        const entries = result.stdout.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (entries.length === 0) {
          return {
            content: [{ type: "text" as const, text: "(empty directory)" }],
            details: undefined,
          };
        }

        const selectedEntries = entries.slice(0, effectiveLimit);
        let text = selectedEntries.join("\n");

        if (entries.length > effectiveLimit) {
          text += `\n\n[Showing first ${effectiveLimit} entries. Use limit=${effectiveLimit * 2} for more.]`;
        }

        return {
          content: [{ type: "text" as const, text }],
          details: undefined,
        };
      } catch {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }
    },
  };
}
