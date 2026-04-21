import { openSync } from "node:fs";
import { spawn } from "node:child_process";
import { getGatewayLogPath } from "../paths/getGatewayLogPath.js";
import { getGatewayLaunchSpec } from "./getGatewayLaunchSpec.js";

/**
 * Starts the detached gateway daemon process.
 *
 * @returns Spawned daemon process id.
 */
export function spawnGatewayProcess(): number {
  const { command, args } = getGatewayLaunchSpec();
  const logPath = getGatewayLogPath();
  const logFd = openSync(logPath, "a");
  const child = spawn(command, args, {
    cwd: process.cwd(),
    detached: true,
    env: process.env,
    stdio: ["ignore", logFd, logFd],
  });

  if (!child.pid) {
    throw new Error("Gateway process did not provide a pid");
  }

  child.unref();
  return child.pid;
}
