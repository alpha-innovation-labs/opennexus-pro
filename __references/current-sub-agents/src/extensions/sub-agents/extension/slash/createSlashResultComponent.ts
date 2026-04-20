import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Container } from "@mariozechner/pi-tui";
import { getSlashRenderableSnapshot, type SlashMessageDetails } from "../../vendor/slash-live-state.js";
import { rebuildSlashResultContainer } from "./rebuildSlashResultContainer.js";

/**
 * Creates the live slash-result component used in the conversation view.
 *
 * @param details Slash message details.
 * @param options Renderer options.
 * @param theme Pi UI theme.
 * @returns A container that re-renders from slash snapshots.
 */
export function createSlashResultComponent(
	details: SlashMessageDetails,
	options: { expanded: boolean },
	theme: ExtensionContext["ui"]["theme"],
): Container {
	const container = new Container();
	let lastVersion = -1;

	container.render = (width: number): string[] => {
		const snapshot = getSlashRenderableSnapshot(details);
		if (snapshot.version !== lastVersion) {
			lastVersion = snapshot.version;
			rebuildSlashResultContainer(container, snapshot.result, options, theme);
		}
		return Container.prototype.render.call(container, width);
	};

	return container;
}
