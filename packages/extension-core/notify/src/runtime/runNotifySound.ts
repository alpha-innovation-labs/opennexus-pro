import { spawn } from "node:child_process";

/**
 * Runs the configured notification sound hook without blocking the app.
 *
 * @param command Shell command to run.
 * @param spawnFn Spawn dependency.
 */
export function runNotifySound(
	command: string | undefined,
	spawnFn: typeof spawn = spawn,
): void {
	if (!command) return;
	try {
		const child = spawnFn(command, {
			shell: true,
			detached: true,
			stdio: "ignore",
		});
		child.unref();
	} catch {}
}
