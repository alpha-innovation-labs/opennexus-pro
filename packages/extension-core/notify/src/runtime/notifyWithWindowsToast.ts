import { execFile } from "node:child_process";
import { buildWindowsToastScript } from "./buildWindowsToastScript";

/**
 * Sends a Windows toast notification.
 *
 * @param title Notification title.
 * @param body Notification body.
 * @param execFileFn Exec function dependency.
 */
export function notifyWithWindowsToast(
	title: string,
	body: string,
	execFileFn: typeof execFile = execFile,
): void {
	execFileFn("powershell.exe", [
		"-NoProfile",
		"-Command",
		buildWindowsToastScript(title, body),
	]);
}
