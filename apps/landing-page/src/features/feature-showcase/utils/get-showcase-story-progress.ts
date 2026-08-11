import { clamp } from "./clamp";

/**
 * Calculates terminal slide progress from the showcase container's viewport position.
 *
 * @param rect Showcase container bounds relative to the viewport.
 * @param viewportHeight Current viewport height used to keep scroll timing proportional.
 * @returns A value from 0 at section entry to 1 once the terminal is settled left.
 */
export function getShowcaseStoryProgress(
	rect: DOMRect,
	viewportHeight: number,
): number {
	const animationStartLine = viewportHeight * 0.055;
	const animationDistance = viewportHeight * 0.095;

	return clamp((animationStartLine - rect.top) / animationDistance, 0, 1);
}
