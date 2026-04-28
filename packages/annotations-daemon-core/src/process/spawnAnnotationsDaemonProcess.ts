import { spawn } from "node:child_process";
import { openSync } from "node:fs";
import { getAnnotationsDaemonLogPath } from "../paths/getAnnotationsDaemonLogPath.js";
import { getAnnotationsDaemonLaunchSpec } from "./getAnnotationsDaemonLaunchSpec.js";

/**
 * Starts the detached annotations daemon process.
 *
 * @returns Spawned daemon process id.
 */
export function spawnAnnotationsDaemonProcess(): number {
  const { command, args } = getAnnotationsDaemonLaunchSpec();
  const logFd = openSync(getAnnotationsDaemonLogPath(), "a");
  const child = spawn(command, args, {
    cwd: process.cwd(),
    detached: true,
    env: process.env,
    stdio: ["ignore", logFd, logFd],
  });

  if (!child.pid) throw new Error("Annotations daemon process did not provide a pid");
  child.unref();
  return child.pid;
}
