import { createFindTool } from "@mariozechner/pi-coding-agent";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore.js";
import { resolveRtkPath } from "../runtime/resolveRtkPath.js";

/**
 * Creates the RTK-backed find tool.
 *
 * @returns RTK-aware find tool definition.
 */
export function createRtkFindTool(cwd = process.cwd(), useProcessCwdFallback = true) {
  const template = createFindTool(cwd);

  return {
    ...template,
    async execute(toolCallId: string, params: Parameters<typeof template.execute>[1], signal?: AbortSignal, onUpdate?: Parameters<typeof template.execute>[3], ctx?: { cwd?: string }) {
      const executionCwd = ctx?.cwd ?? (useProcessCwdFallback ? process.cwd() : cwd);
      const original = createFindTool(executionCwd);
      const runtime = getRtkRuntimeForCwd(executionCwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate);
      }

      const input = params as { pattern: string; path?: string; limit?: number };

      try {
        const searchPath = resolveRtkPath(executionCwd, input.path ?? ".");
        const effectiveLimit = Math.max(1, input.limit ?? 1000);
        const patternArgs = input.pattern.includes("/")
          ? ["-path", input.pattern.startsWith("*") || input.pattern.startsWith("/") ? input.pattern : `*${input.pattern}`]
          : ["-name", input.pattern];
        const result = await runtime.exec("find", [searchPath, ...patternArgs], { cwd: executionCwd, signal });

        if (result.code !== 0 && result.stdout.trim().length === 0) {
          return original.execute(toolCallId, params, signal, onUpdate);
        }

        const lines = result.stdout.split(/\r?\n/);
        const hasHeader = lines.length >= 2 && lines[1].trim() === "";
        const header = hasHeader ? lines.slice(0, 2) : [];
        const entries = (hasHeader ? lines.slice(2) : lines).filter((line) => line.trim().length > 0);

        if (header.length === 0 && entries.length === 0) {
          return {
            content: [{ type: "text" as const, text: result.stdout.trim() }],
            details: undefined,
          };
        }

        const selectedEntries = entries.slice(0, effectiveLimit);
        let text = [...header, ...selectedEntries].join("\n");

        if (entries.length > effectiveLimit) {
          text += `\n\n[Showing first ${effectiveLimit} results. Use limit=${effectiveLimit * 2} for more.]`;
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
