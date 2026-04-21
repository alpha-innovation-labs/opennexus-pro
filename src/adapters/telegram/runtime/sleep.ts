/**
 * Waits for a number of milliseconds.
 *
 * @param delayMs Delay in milliseconds.
 * @returns A promise that resolves after the delay.
 */
export async function sleep(delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
