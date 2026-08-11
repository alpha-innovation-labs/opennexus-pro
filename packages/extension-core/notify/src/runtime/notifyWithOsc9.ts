import { wrapForTmux } from "./wrapForTmux";

/**
 * Sends a terminal notification using iTerm2 OSC 9.
 *
 * @param message Full notification text.
 * @param write Output writer.
 * @param env Environment variables.
 */
export function notifyWithOsc9(
	message: string,
	write: (value: string) => void = (value) => void process.stdout.write(value),
	env: NodeJS.ProcessEnv = process.env,
): void {
	write(wrapForTmux(`\x1b]9;${message}\x07`, env));
}
