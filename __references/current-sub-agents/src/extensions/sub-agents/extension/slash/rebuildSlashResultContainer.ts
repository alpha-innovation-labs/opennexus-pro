import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Box, Container, Spacer } from "@mariozechner/pi-tui";
import { renderSubagentResult } from "../../vendor/render.js";
import type { Details } from "../../vendor/types.js";
import { isSlashResultError } from "./isSlashResultError.js";
import { isSlashResultRunning } from "./isSlashResultRunning.js";

/**
 * Rebuilds the current slash-result container contents.
 *
 * @param container Container to refresh.
 * @param result Current tool result snapshot.
 * @param options Renderer options.
 * @param theme Pi UI theme.
 */
export function rebuildSlashResultContainer(
	container: Container,
	result: AgentToolResult<Details>,
	options: { expanded: boolean },
	theme: ExtensionContext["ui"]["theme"],
): void {
	container.clear();
	container.addChild(new Spacer(1));

	const boxTheme = isSlashResultRunning(result)
		? "toolPendingBg"
		: isSlashResultError(result)
			? "toolErrorBg"
			: "toolSuccessBg";
	const box = new Box(1, 1, (text: string) => theme.bg(boxTheme, text));
	box.addChild(renderSubagentResult(result, options, theme));
	container.addChild(box);
}
