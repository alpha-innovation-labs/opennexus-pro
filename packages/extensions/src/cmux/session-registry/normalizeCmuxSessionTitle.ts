/**
 * Normalizes a Nexus session title stored in the cmux registry.
 *
 * @param title Candidate Nexus session title.
 * @returns Trimmed single-line title or undefined.
 */
export function normalizeCmuxSessionTitle(title: string | undefined): string | undefined {
	const normalized = title?.replace(/\s+/g, " ").trim();
	return normalized || undefined;
}
