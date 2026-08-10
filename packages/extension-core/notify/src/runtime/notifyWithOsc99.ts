import { wrapForTmux } from "./wrapForTmux";

/**
 * Sends a terminal notification using Kitty OSC 99.
 *
 * @param title Notification title.
 * @param body Notification body.
 * @param write Output writer.
 * @param env Environment variables.
 */
export function notifyWithOsc99(
	title: string,
	body: string,
	write: (value: string) => void = (value) => void process.stdout.write(value),
	env: NodeJS.ProcessEnv = process.env,
): void {
	write(wrapForTmux(`\x1b]99;i=1:d=0;${title}\x1b\\`, env));
	write(wrapForTmux(`\x1b]99;i=1:p=body;${body}\x1b\\`, env));
}
