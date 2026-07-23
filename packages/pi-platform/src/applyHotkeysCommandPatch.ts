import { InteractiveMode } from "@earendil-works/pi-coding-agent/dist/modes/interactive/interactive-mode.js";
import { getHotkeysCommandHook } from "./hotkeysCommandHook.js";

let hotkeysCommandPatchApplied = false;

/**
 * Routes Pi's built-in /hotkeys command through the Nexus-owned hotkeys panel.
 */
export function applyHotkeysCommandPatch(): void {
  if (hotkeysCommandPatchApplied) return;

  const prototype = InteractiveMode.prototype as unknown as {
    handleHotkeysCommand(): void;
  };
  const originalHandleHotkeysCommand = prototype.handleHotkeysCommand;

  prototype.handleHotkeysCommand = function handleHotkeysCommand(this: unknown): void {
    const hook = getHotkeysCommandHook();
    if (!hook) return originalHandleHotkeysCommand.call(this);
    void hook(this);
  };

  hotkeysCommandPatchApplied = true;
}
