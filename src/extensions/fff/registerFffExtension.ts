import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { loadFeatureState } from "./features/loadFeatureState.js";
import { registerGrepOverride } from "./grep/registerGrepOverride.js";
import { registerReadOverride } from "./read/registerReadOverride.js";
import { FffRuntime } from "./runtime/FffRuntime.js";
import { clearRuntimeForCwd, setRuntimeForCwd } from "./runtime/runtimeStore.js";

let activeCtx: ExtensionContext | undefined;
let activeRuntime: FffRuntime | undefined;

/**
 * Registers the local bundled FFF extension.
 *
 * @param pi Pi extension API.
 */
export function registerFffExtension(pi: ExtensionAPI): void {
  registerReadOverride(pi);
  registerGrepOverride(pi);

  pi.on("session_start", async (_event, ctx) => {
    activeRuntime?.dispose();
    if (activeCtx) {
      clearRuntimeForCwd(activeCtx.cwd);
    }
    await loadFeatureState();
    activeCtx = ctx;
    activeRuntime = new FffRuntime(ctx.cwd);
    setRuntimeForCwd(ctx.cwd, activeRuntime);
    try {
      await activeRuntime.ensure();
    } catch (error) {
      ctx.ui.notify(`fff unavailable: ${error instanceof Error ? error.message : String(error)}`, "warning");
    }
  });

  pi.on("session_shutdown", async () => {
    if (activeCtx) {
      clearRuntimeForCwd(activeCtx.cwd);
    }
    activeRuntime?.dispose();
    activeCtx = undefined;
    activeRuntime = undefined;
  });
}
