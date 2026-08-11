import { existsSync } from "node:fs";

const unixPlayers = [
	["afplay", 'while true; do afplay "$0" || exit 0; done'],
	[
		"ffplay",
		'while true; do ffplay -nodisp -autoexit -loglevel quiet "$0" || exit 0; done',
	],
	["mpg123", 'while true; do mpg123 -q "$0" || exit 0; done'],
	["mpv", 'while true; do mpv --no-video --really-quiet "$0" || exit 0; done'],
] as const;

/**
 * Returns a portable loop script for the first available OS audio player.
 *
 * @returns Shell script, or null when no supported player exists.
 */
export function getTetrisMusicPlayerScript(): string | null {
	for (const [binary, script] of unixPlayers) {
		if (isCommandAvailable(binary)) return script;
	}
	return null;
}

/**
 * Checks whether a command exists on PATH.
 *
 * @param command Command name.
 * @returns True when executable exists.
 */
function isCommandAvailable(command: string): boolean {
	const pathValue = process.env.PATH ?? "";
	return pathValue
		.split(":")
		.some((entry) => existsSync(`${entry}/${command}`));
}
