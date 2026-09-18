/** Pad or truncate a line to exactly `target` columns. */
export function padOrTruncate(line: string, target: number): string {
	if (line.length < target) {
		return line + ' '.repeat(target - line.length);
	}
	if (line.length > target) {
		return `${line.slice(0, target - 1)}…`;
	}
	return line;
}

/**
 * Right-align `s` in a field of width `w`. If `s` is wider than `w` the leading
 * characters are dropped so the field width (and column alignment) is preserved.
 */
export function rightAlign(s: string, w: number): string {
	if (s.length > w) return s.slice(s.length - w);
	return s.padStart(w, ' ');
}

/**
 * Truncate a path in the middle, keeping the tail (basename) when it fits.
 *
 * @param path Input path.
 * @param max Maximum output width.
 * @returns Truncated path with a single `…` in the middle.
 */
export function middleTruncatePath(path: string, max = 40): string {
	if (!path || path.length <= max) return path;
	if (max <= 4) return path.slice(0, max);
	const keep = max - 1; // reserve 1 column for the ellipsis
	const lastSlash = path.lastIndexOf('/');
	const tail = lastSlash >= 0 ? path.slice(lastSlash) : path; // includes the leading '/'
	if (tail.length < keep) {
		const head = path.slice(0, keep - tail.length);
		return `${head}…${tail}`;
	}
	const left = Math.ceil(keep / 2);
	const right = Math.floor(keep / 2);
	return `${path.slice(0, left)}…${path.slice(path.length - right)}`;
}
