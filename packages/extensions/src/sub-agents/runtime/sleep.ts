/**
 * Waits for the requested number of milliseconds.
 *
 * @param ms Delay duration.
 * @returns Promise that resolves after the delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
