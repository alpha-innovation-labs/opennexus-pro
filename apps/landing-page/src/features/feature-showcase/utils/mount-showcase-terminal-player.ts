import { createShowcasePlayerOptions } from "./create-showcase-player-options";

type AsciinemaPlayerInstance = {
	readonly dispose?: () => void;
};

/**
 * Mounts an Asciinema recording into a terminal element.
 *
 * @param target Element that receives the player.
 * @param castSrc Recording source URL.
 * @returns The mounted player instance.
 */
export function mountShowcaseTerminalPlayer(
	target: HTMLElement,
	castSrc: string,
): AsciinemaPlayerInstance | null {
	if (!window.AsciinemaPlayer) return null;

	target.replaceChildren();
	return window.AsciinemaPlayer.create(
		castSrc,
		target,
		createShowcasePlayerOptions(),
	) as AsciinemaPlayerInstance;
}
