import { getLanguageFromPath, highlightCode, type Theme } from '@earendil-works/pi-coding-agent';

/**
 * Path-based, cached syntax highlighter built on pi's {@link highlightCode}.
 *
 * One instance is bound to a single file path (and therefore a single language)
 * and a single theme. It is shared by the `edit` tool (the diff renderer, which
 * highlights context lines one at a time via {@link highlightLine}) and the
 * `write` tool (which highlights a whole file via {@link highlightBlock}).
 *
 * File types: the language is detected from the file path via pi's
 * {@link getLanguageFromPath} extension map, so every file type pi knows about
 * is highlighted. Unknown or extension-less paths resolve to no language and
 * fall back to a flat color — they never throw.
 */
export class SyntaxHighlighter {
	private readonly lang: string | undefined;
	private readonly theme: Theme;
	/** Per-line results, keyed by the (already tab-expanded) line text. */
	private readonly lineCache = new Map<string, string | undefined>();
	/** Block results, keyed by the joined block text. */
	private readonly blockCache = new Map<string, string[]>();

	/**
	 * @param filePath File path used to detect the language (may be empty/undefined).
	 * @param theme Tron theme used for the flat-color fallback.
	 */
	constructor(filePath: string | undefined, theme: Theme) {
		this.theme = theme;
		this.lang = filePath ? getLanguageFromPath(filePath) : undefined;
	}

	/** The detected language, or `undefined` for unknown/extension-less paths. */
	get language(): string | undefined {
		return this.lang;
	}

	/**
	 * Highlight a single line of source with per-token color.
	 *
	 * Returns `undefined` when no language was detected or highlighting fails, so
	 * the caller falls back to its own flat role color. This is what the diff
	 * renderer uses for unchanged (context) lines.
	 */
	highlightLine(content: string): string | undefined {
		if (!this.lang) return undefined;
		const hit = this.lineCache.get(content);
		if (hit !== undefined) return hit;

		let out: string | undefined;
		try {
			out = highlightCode(content, this.lang)[0];
		} catch {
			out = undefined;
		}
		this.lineCache.set(content, out);
		return out;
	}

	/**
	 * Highlight a block of source lines, returning one styled string per input
	 * line. Unknown languages and highlighting failures fall back to a flat
	 * `toolOutput` color per line. This is what the `write` tool uses to render a
	 * whole file.
	 */
	highlightBlock(lines: string[]): string[] {
		if (lines.length === 0) return [];
		if (!this.lang) return lines.map((line) => this.theme.fg('toolOutput', line));

		const key = lines.join('\n');
		const hit = this.blockCache.get(key);
		if (hit !== undefined) return hit;

		let out: string[];
		try {
			out = highlightCode(key, this.lang);
		} catch {
			out = lines.map((line) => this.theme.fg('toolOutput', line));
		}
		this.blockCache.set(key, out);
		return out;
	}

	/** Clear all cached results. */
	invalidate(): void {
		this.lineCache.clear();
		this.blockCache.clear();
	}
}
