import { openSync } from "node:fs";
import { spawn } from "node:child_process";
import { getAutomationDaemonLogPath } from "../paths/getAutomationDaemonLogPath.js";
import { getAutomationLaunchSpec } from "./getAutomationLaunchSpec.js";

/**
 * Starts the detached automation daemon process.
 *
 * @returns Spawned daemon process id.
 */
export function spawnAutomationDaemonProcess(): number {
	const { command, args } = getAutomationLaunchSpec();
	const logFd = openSync(getAutomationDaemonLogPath(), "a");
	const child = spawn(command, args, {
		cwd: process.cwd(),
		detached: true,
		env: process.env,
		stdio: ["ignore", logFd, logFd],
	});
	if (!child.pid) throw new Error("Automation daemon did not provide a pid");
	child.unref();
	return child.pid;
}
