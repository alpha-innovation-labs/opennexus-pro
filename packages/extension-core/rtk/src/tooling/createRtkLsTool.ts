import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import { createLsTool } from "@earendil-works/pi-coding-agent";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore";
import { resolveRtkPath } from "../runtime/resolveRtkPath";

/**
 * Creates the RTK-backed ls tool.
 *
 * @returns RTK-aware ls tool definition.
 */
export function createRtkLsTool(cwd = process.cwd(), useProcessCwdFallback = true): ToolDefinition {
  const template = createLsTool(cwd);

  return {
    ...template,
    async execute(toolCallId: string, params: Parameters<typeof template.execute>[1], signal?: AbortSignal, onUpdate?: Parameters<typeof template.execute>[3], ctx?: { cwd?: string }) {
      const executionCwd = ctx?.cwd ?? (useProcessCwdFallback ? process.cwd() : cwd);
      const original = createLsTool(executionCwd);
      const runtime = getRtkRuntimeForCwd(executionCwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate);
      }

      const input = params as { path?: string; limit?: number };

      try {
        const dirPath = resolveRtkPath(executionCwd, input.path ?? ".");
        const effectiveLimit = Math.max(1, input.limit ?? 500);
        const result = await runtime.exec("ls", [dirPath], { cwd: executionCwd, signal });

        if (result.code !== 0 && result.stdout.trim().length === 0) {
          return original.execute(toolCallId, params, signal, onUpdate);
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
        return original.execute(toolCallId, params, signal, onUpdate);
      }
    },
  };
}
