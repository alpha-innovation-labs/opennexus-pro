import type { Component } from "@earendil-works/pi-tui";
import { renderMarkdownPreview } from "./renderMarkdownPreview";
import type { MarkdownPreviewTheme } from "./types";

/** Options for the composable markdown preview component. */
export type MarkdownPreviewComponentOptions = {
	markdown: string;
	theme?: MarkdownPreviewTheme;
};

/** Composable TUI component that renders Ratkit-inspired markdown preview lines. */
export class MarkdownPreview implements Component {
	private markdown: string;
	private readonly theme?: MarkdownPreviewTheme;

	/** Creates a markdown preview component. */
	constructor(options: MarkdownPreviewComponentOptions) {
		this.markdown = options.markdown;
		this.theme = options.theme;
	}

	/** Replaces the markdown source rendered by this component. */
	setMarkdown(markdown: string): void {
		this.markdown = markdown;
	}

	/** Renders the markdown preview to terminal rows. */
	render(width: number): string[] {
		return renderMarkdownPreview({
			markdown: this.markdown,
			theme: this.theme,
			width,
		});
	}

	/** Clears render caches for theme changes. */
	invalidate(): void {}
}
