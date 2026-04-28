import { startupHeroTips } from "./startupHeroTips.js";

/**
 * Selects one startup hero tip for the current startup render.
 *
 * @param random Random number provider returning a value in the range [0, 1).
 * @returns One configured startup hero tip.
 */
export function pickStartupHeroTip(random: () => number = Math.random): string {
	const index = Math.min(startupHeroTips.length - 1, Math.floor(random() * startupHeroTips.length));
	return startupHeroTips[Math.max(0, index)] ?? "";
}
