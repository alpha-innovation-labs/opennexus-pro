/**
 * Waits briefly before retrying chat-status lock acquisition.
 */
export async function waitForChatStatusFileLockRetry(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 10));
}
