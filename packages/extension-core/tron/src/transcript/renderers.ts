import { renderCompactInputBubble } from "../user-message/renderCompactInputBubble";
import type { EntryRenderer } from "./types";

/**
 * Simple renderer that returns precomputed lines.
 */
export class StaticEntryRenderer implements EntryRenderer {
	constructor(private readonly lines: string[]) {}

	render(): string[] {
		return this.lines;
	}

	invalidate(): void {}
}

/**
 * Renderer for user messages that computes lines on demand.
 */
export class UserMessageRenderer implements EntryRenderer {
	constructor(private readonly text: string) {}

	render(width: number): string[] {
		return renderCompactInputBubble(this.text, width);
	}

	invalidate(): void {}
}

/**
 * Renderer for error messages.
 */
export class ErrorRenderer implements EntryRenderer {
	constructor(
		private readonly text: string,
		private readonly theme: unknown,
	) {}

	render(): string[] {
		return [this.theme.fg("error", `Error: ${this.text}`)];
	}

	invalidate(): void {}
}
