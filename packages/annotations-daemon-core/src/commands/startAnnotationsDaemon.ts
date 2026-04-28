import { spawnAnnotationsDaemonProcess } from "../process/spawnAnnotationsDaemonProcess.js";
import { waitForAnnotationsDaemonReady } from "../process/waitForAnnotationsDaemonReady.js";
import { ensureAnnotationsDaemonRootDir } from "../runner/ensureAnnotationsDaemonRootDir.js";
import type { AnnotationsDaemonStatus } from "../state/types.js";
import { getAnnotationsDaemonStatus } from "./getAnnotationsDaemonStatus.js";

export interface StartAnnotationsDaemonResult {
  started: boolean;
  status: AnnotationsDaemonStatus;
}

/**
 * Starts the annotations daemon when it is not already running.
 *
 * @returns Start result and resulting daemon status.
 */
export async function startAnnotationsDaemon(): Promise<StartAnnotationsDaemonResult> {
  const currentStatus = await getAnnotationsDaemonStatus();
  if (currentStatus.running) return { started: false, status: currentStatus };

  await ensureAnnotationsDaemonRootDir();
  spawnAnnotationsDaemonProcess();
  return { started: true, status: await waitForAnnotationsDaemonReady(5000) };
}
