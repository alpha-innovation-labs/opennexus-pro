/**
 * Parses porcelain branch ahead/behind counts.
 *
 * @param line Git status branch line.
 * @returns Ahead and behind counts.
 */
export function parseBranchAb(line: string): { ahead: number; behind: number } {
	const match = line.match(/\+(-?\d+)\s+-(\d+)/);
	return {
		ahead: match ? Number.parseInt(match[1] ?? "0", 10) : 0,
		behind: match ? Number.parseInt(match[2] ?? "0", 10) : 0,
	};
}
