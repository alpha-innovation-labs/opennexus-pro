export type CompositeLineAt = (
	this: TuiWithInlineImageOverlayPatch,
	baseLine: string,
	overlayLine: string,
	startCol: number,
	overlayWidth: number,
	totalWidth: number,
) => string;

export type DoRender = (this: TuiWithInlineImageOverlayPatch) => void;

export type TuiWithInlineImageOverlayPatch = {
	terminal: { write(data: string): void };
	compositeLineAt: CompositeLineAt;
	doRender: DoRender;
	hasOverlay(): boolean;
};
