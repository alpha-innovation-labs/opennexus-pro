/**
 * Parses a version string into numeric major, minor, and patch parts.
 *
 * @param version Version string to parse.
 * @returns Numeric version parts, missing or invalid parts become zero.
 */
export function parseVersionParts(version: string): [number, number, number] {
	const clean = version.trim().replace(/^v/u, "").split("-", 1)[0] ?? "";
	const parts = clean
		.split(".")
		.slice(0, 3)
		.map((part) => {
			const parsed = Number.parseInt(part.replace(/\D.*$/u, ""), 10);
			return Number.isFinite(parsed) ? parsed : 0;
		});
	return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}
