import { stripMarkdownBullet } from "./stripMarkdownBullet";

/**
 * Normalizes free-form summarizer output into markdown bullets.
 *
 * @param text Summarizer output.
 * @returns Canonical bullet lines.
 */
export function normalizeBullets(text: string): string[] {
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => (line.startsWith("-") ? line : `- ${line.replace(/^\d+[.)]\s+/, "")}`))
		.map((line) => `- ${stripMarkdownBullet(line)}`)
		.filter((line) => stripMarkdownBullet(line).length > 0);
}
