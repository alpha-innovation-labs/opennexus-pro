import { createBashTool } from "@mariozechner/pi-coding-agent";
import { getRtkRuntimeForCwd } from "../runtime/runtimeStore.js";

/**
 * Creates the RTK-backed bash tool.
 *
 * @returns RTK-aware bash tool definition.
 */
export function createRtkBashTool() {
  const template = createBashTool(process.cwd());

  return {
    ...template,
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const original = createBashTool(ctx.cwd);
      const runtime = getRtkRuntimeForCwd(ctx.cwd);
      if (!runtime) {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }

      const input = params as { command: string };

      try {
        const rewrite = await runtime.exec("rewrite", [input.command], { cwd: ctx.cwd, signal });
        const rewritten = rewrite.code === 0 ? rewrite.stdout.trim() : "";
        const command = rewritten && rewritten !== input.command ? rewritten : input.command;

        return original.execute(
          toolCallId,
          { ...params, command },
          signal,
          onUpdate,
          ctx,
        );
      } catch {
        return original.execute(toolCallId, params, signal, onUpdate, ctx);
      }
    },
  };
}
