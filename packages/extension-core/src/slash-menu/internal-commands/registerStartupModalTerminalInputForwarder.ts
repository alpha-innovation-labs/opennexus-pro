import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export type StartupInputModal = {
  handleInput(data: string): void;
};

/**
 * Forwards raw terminal input to a startup modal so it remains keyboard driven even when startup code restores editor focus.
 *
 * @param ctx Extension context that owns the terminal input listener.
 * @param modal Modal that should receive keyboard input.
 * @param requestRender Render callback after each forwarded key.
 * @returns Cleanup function that unregisters the terminal input listener.
 */
export function registerStartupModalTerminalInputForwarder(
  ctx: ExtensionContext,
  modal: StartupInputModal,
  requestRender: () => void,
): () => void {
  return ctx.ui.onTerminalInput((data) => {
    modal.handleInput(data);
    requestRender();
    return { consume: true };
  });
}
