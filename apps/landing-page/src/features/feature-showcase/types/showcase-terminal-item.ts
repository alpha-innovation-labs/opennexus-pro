import type { ShowcaseExample } from "./showcase-feature";

/**
 * Describes one scroll-synced terminal recording entry for the showcase story.
 */
export type ShowcaseTerminalItem = {
	readonly example: ShowcaseExample;
	readonly groupId: string;
	readonly groupLabel: string;
	readonly castSrc: string;
};
