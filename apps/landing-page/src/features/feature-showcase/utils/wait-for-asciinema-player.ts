/**
 * Waits until the bundled Asciinema runtime is available on window.
 *
 * @param signal Cancellation signal for component cleanup.
 * @returns Whether the runtime became available.
 */
export function waitForAsciinemaPlayer(signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;

    /** Polls on animation frames so Next script timing and hydration order are both handled. */
    function checkRuntime(): void {
      if (signal.aborted) {
        resolve(false);
        return;
      }

      if (window.AsciinemaPlayer) {
        resolve(true);
        return;
      }

      attempts += 1;
      if (attempts > 240) {
        resolve(false);
        return;
      }

      window.requestAnimationFrame(checkRuntime);
    }

    checkRuntime();
  });
}
