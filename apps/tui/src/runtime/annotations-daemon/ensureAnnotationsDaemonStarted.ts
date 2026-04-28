import { startAnnotationsDaemon } from "@nexus/annotations-daemon-core/commands/startAnnotationsDaemon.js";

/**
 * Ensures the local annotations daemon is running for browser feedback capture.
 */
export async function ensureAnnotationsDaemonStarted(): Promise<void> {
  try {
    await startAnnotationsDaemon();
  } catch (error) {
    console.warn(`Annotations daemon unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}
