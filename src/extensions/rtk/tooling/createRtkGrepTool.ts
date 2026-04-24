import { createGrepTool } from "@mariozechner/pi-coding-agent";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore.js";
import { resolveRtkPath } from "../runtime/resolveRtkPath.js";

/**
 * Creates the RTK-backed grep tool.
 *
 * @returns RTK-aware grep tool definition.
 */
export function createRtkGrepTool() {
  const template = createGrepTool(process.cwd());

  return {
    ...template,
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const original = createGrepTool(ctx.cwd);
      const runtime = getRtkRuntimeForCwd(ctx.cwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
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
        const searchPath = resolveRtkPath(ctx.cwd, input.path ?? ".");
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

        const result = await runtime.exec("grep", [input.pattern, searchPath, ...extraArgs], { cwd: ctx.cwd, signal });
        if (result.code !== 0 && result.stdout.trim().length === 0) {
          return original.execute(toolCallId, params, signal, onUpdate, ctx);
        }

        const text = result.stdout.trim();
        return {
          content: [{ type: "text" as const, text: text || "No matches found" }],
          details: undefined,
        };
      } catch {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }
    },
  };
}
