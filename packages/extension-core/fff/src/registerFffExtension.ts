import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { loadFeatureState } from "./features/loadFeatureState.js";
import { registerGrepOverride } from "./grep/registerGrepOverride.js";
import { registerReadOverride } from "./read/registerReadOverride.js";
import { FffRuntime } from "./runtime/FffRuntime.js";
import { clearRuntimeForCwd, setRuntimeForCwd } from "./runtime/runtimeStore.js";

let activeCtx: ExtensionContext | undefined;
let activeRuntime: FffRuntime | undefined;

/**
 * Creates a one-shot reporter for first-use FFF initialization failures.
 *
 * @param ctx Session context.
 * @returns Reporter that warns once per session.
 */
function createUnavailableReporter(ctx: ExtensionContext): (message: string) => void {
  let warned = false;
  return (message: string) => {
    if (warned) return;
    warned = true;
    ctx.ui.notify(`fff unavailable: ${message}`, "warning");
  };
}

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
    activeRuntime = new FffRuntime(ctx.cwd, createUnavailableReporter(ctx));
    setRuntimeForCwd(ctx.cwd, activeRuntime);
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
