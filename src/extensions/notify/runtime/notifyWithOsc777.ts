import { wrapForTmux } from "./wrapForTmux.js";

/**
 * Sends a terminal notification using OSC 777.
 *
 * @param title Notification title.
 * @param body Notification body.
 * @param write Output writer.
 * @param env Environment variables.
 */
export function notifyWithOsc777(
	title: string,
	body: string,
	write: (value: string) => void = (value) => void process.stdout.write(value),
	env: NodeJS.ProcessEnv = process.env,
): void {
	write(wrapForTmux(`\x1b]777;notify;${title};${body}\x07`, env));
}
