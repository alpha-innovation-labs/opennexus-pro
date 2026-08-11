import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import { createReadTool } from "@earendil-works/pi-coding-agent";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore";
import { resolveRtkPath } from "../runtime/resolveRtkPath";

/**
 * Creates the RTK-backed read tool.
 *
 * @returns RTK-aware read tool definition.
 */
export function createRtkReadTool(cwd = process.cwd(), useProcessCwdFallback = true): ToolDefinition {
  const template = createReadTool(cwd);

  return {
    ...template,
    async execute(toolCallId: string, params: Parameters<typeof template.execute>[1], signal?: AbortSignal, onUpdate?: Parameters<typeof template.execute>[3], ctx?: { cwd?: string }) {
      const executionCwd = ctx?.cwd ?? (useProcessCwdFallback ? process.cwd() : cwd);
      const original = createReadTool(executionCwd);
      const runtime = getRtkRuntimeForCwd(executionCwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate);
      }

      const input = params as { path: string; offset?: number; limit?: number };

      try {
        const resolvedPath = resolveRtkPath(executionCwd, input.path);
        // Build CLI args: always include -n for line numbers; add -m <limit> when limit is explicit.
        const cliArgs = ["-n", resolvedPath];
        if (input.limit !== undefined) {
          cliArgs.push("-m", String(input.limit));
        }

        const result = await runtime.exec("read", cliArgs, { cwd: executionCwd, signal });
        if (result.code !== 0) {
          return original.execute(toolCallId, params, signal, onUpdate);
        }

        const numberedLines = result.stdout
          .split(/\r?\n/)
          .filter((line) => /^\s*\d+\s*[│|]/.test(line));

        if (numberedLines.length === 0) {
          return {
            content: [{ type: "text" as const, text: result.stdout.trim() }],
            details: undefined,
          };
        }

        // When the user did NOT specify offset or limit, let RTK return everything
        // without JavaScript-level slicing — the RTK CLI handles its own defaults.
        if (input.offset === undefined && input.limit === undefined) {
          const text = numberedLines.join("\n");
          return {
            content: [{ type: "text" as const, text }],
            details: undefined,
          };
        }

        // User requested offset and/or limit — apply JavaScript slicing as a
        // safety net when RTK returns fewer lines than the user asked for.
        const startIndex = Math.max(0, (input.offset ?? 1) - 1);
        if (startIndex >= numberedLines.length) {
          throw new Error(`Offset ${input.offset} is beyond end of file (${numberedLines.length} lines total)`);
        }

        const effectiveLimit = Math.max(1, input.limit ?? numberedLines.length);
        const endIndex = Math.min(startIndex + effectiveLimit, numberedLines.length);
        let text = numberedLines.slice(startIndex, endIndex).join("\n");

        if (endIndex < numberedLines.length) {
          text += `\n\n[Showing lines ${startIndex + 1}-${endIndex} of ${numberedLines.length}. Use offset=${endIndex + 1} to continue.]`;
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
