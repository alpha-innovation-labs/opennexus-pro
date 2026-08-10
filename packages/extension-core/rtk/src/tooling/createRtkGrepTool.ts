import { createGrepTool } from "@earendil-works/pi-coding-agent";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore";
import { resolveRtkPath } from "../runtime/resolveRtkPath";

/**
 * Creates the RTK-backed grep tool.
 *
 * @returns RTK-aware grep tool definition.
 */
export function createRtkGrepTool(cwd = process.cwd(), useProcessCwdFallback = true) {
  const template = createGrepTool(cwd);

  return {
    ...template,
    async execute(toolCallId: string, params: Parameters<typeof template.execute>[1], signal?: AbortSignal, onUpdate?: Parameters<typeof template.execute>[3], ctx?: { cwd?: string }) {
      const executionCwd = ctx?.cwd ?? (useProcessCwdFallback ? process.cwd() : cwd);
      const original = createGrepTool(executionCwd);
      const runtime = getRtkRuntimeForCwd(executionCwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate);
      }

      const input = params as {
        pattern: string;
        path?: string;
        glob?: string;
        ignoreCase?: boolean;
        literal?: boolean;
        context?: number;
        limit?: number;
      };

      try {
        const searchPath = resolveRtkPath(executionCwd, input.path ?? ".");
        const effectiveLimit = Math.max(1, input.limit ?? 100);
        const extraArgs: string[] = [];

        if (input.ignoreCase) {
          extraArgs.push("-i");
        }

        if (input.literal) {
          extraArgs.push("-F");
        }

        if (input.glob) {
          extraArgs.push("--glob", input.glob);
        }

        if (typeof input.context === "number" && input.context > 0) {
          extraArgs.push("-C", String(input.context));
        }

        extraArgs.push("-m", String(effectiveLimit));

        const result = await runtime.exec("grep", [input.pattern, searchPath, ...extraArgs], { cwd: executionCwd, signal });
        if (result.code !== 0 && result.stdout.trim().length === 0) {
          return original.execute(toolCallId, params, signal, onUpdate);
        }

        const text = result.stdout.trim();
        return {
          content: [{ type: "text" as const, text: text || "No matches found" }],
          details: undefined,
        };
      } catch {
        return original.execute(toolCallId, params, signal, onUpdate);
      }
    },
  };
}
