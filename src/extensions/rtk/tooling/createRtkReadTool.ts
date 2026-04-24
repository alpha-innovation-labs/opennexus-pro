import { createReadTool } from "@mariozechner/pi-coding-agent";
import { getRtkExecutionCwd } from "../runtime/getRtkExecutionCwd.js";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore.js";
import { resolveRtkPath } from "../runtime/resolveRtkPath.js";

/**
 * Creates the RTK-backed read tool.
 *
 * @returns RTK-aware read tool definition.
 */
export function createRtkReadTool() {
  const template = createReadTool(process.cwd());

  return {
    ...template,
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const cwd = getRtkExecutionCwd(ctx);
      const original = createReadTool(cwd);
      const runtime = getRtkRuntimeForCwd(cwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }

      const input = params as { path: string; offset?: number; limit?: number };

      try {
        const resolvedPath = resolveRtkPath(cwd, input.path);
        const result = await runtime.exec("read", ["-n", resolvedPath], { cwd, signal });
        if (result.code !== 0) {
          return original.execute(toolCallId, params, signal, onUpdate, ctx);
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

        const startIndex = Math.max(0, (input.offset ?? 1) - 1);
        if (startIndex >= numberedLines.length) {
          throw new Error(`Offset ${input.offset} is beyond end of file (${numberedLines.length} lines total)`);
        }

        const effectiveLimit = Math.max(1, input.limit ?? 10);
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
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }
    },
  };
}
