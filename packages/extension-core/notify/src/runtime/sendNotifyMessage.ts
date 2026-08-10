import { execFile, spawn } from "node:child_process";
import { getNotifySoundCommand } from "./getNotifySoundCommand";
import { notifyWithOsc777 } from "./notifyWithOsc777";
import { notifyWithOsc9 } from "./notifyWithOsc9";
import { notifyWithOsc99 } from "./notifyWithOsc99";
import { notifyWithWindowsToast } from "./notifyWithWindowsToast";
import { runNotifySound } from "./runNotifySound";

export type NotifyDeps = {
	env?: NodeJS.ProcessEnv;
	platform?: NodeJS.Platform;
	write?: (value: string) => void;
	execFileFn?: typeof execFile;
	spawnFn?: typeof spawn;
};

/**
 * Sends a desktop notification using the terminal or platform-specific protocol.
 *
 * @param title Notification title.
 * @param body Notification body.
 * @param deps Runtime dependencies.
 */
export function sendNotifyMessage(title: string, body: string, deps: NotifyDeps = {}): void {
	const env = deps.env ?? process.env;
	const platform = deps.platform ?? process.platform;
	const write = deps.write ?? ((value: string) => void process.stdout.write(value));
	const execFileFn = deps.execFileFn ?? execFile;
	const spawnFn = deps.spawnFn ?? spawn;
	const isIterm2 = env.TERM_PROGRAM === "iTerm.app" || Boolean(env.ITERM_SESSION_ID);

	if (env.WT_SESSION) notifyWithWindowsToast(title, body, execFileFn);
	else if (env.KITTY_WINDOW_ID) notifyWithOsc99(title, body, write, env);
	else if (isIterm2) notifyWithOsc9(`${title}: ${body}`, write, env);
	else notifyWithOsc777(title, body, write, env);

	runNotifySound(getNotifySoundCommand(env, platform), spawnFn);
}
