import { Text } from "@mariozechner/pi-tui";
import { getSmartEvalResult } from "../state/getSmartEvalResult.js";
import { isSmartEvalPending } from "../score/isSmartEvalPending.js";
import { createSmartEvalFooterText } from "./createSmartEvalFooterText.js";

/**
 * Dynamic footer text that re-reads smart-eval expansion state on every render.
 */
export class SmartEvalFooterText extends Text {
	constructor(
		private readonly baseText: string,
		private readonly assistantTimestamp: number | undefined,
		private readonly theme: { fg: (name: "success" | "error" | "muted", text: string) => string },
	) {
		super("", 1, 0);
	}

	/**
	 * Renders the footer with current smart-eval state.
	 *
	 * @param width Available render width.
	 * @returns Rendered footer lines.
	 */
	render(width: number): string[] {
		this.setText(createSmartEvalFooterText(this.baseText, this.assistantTimestamp, this.theme));
		const result = typeof this.assistantTimestamp === "number" ? getSmartEvalResult(this.assistantTimestamp) : undefined;
		if (result && isSmartEvalPending(result)) this.invalidate();
		return super.render(width);
	}
}
