/**
 * Waits briefly before retrying steering queue lock acquisition.
 */
export async function waitForSteerQueueFileLockRetry(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 10));
}
