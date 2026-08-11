import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerTetrisCommand } from "./command/registerTetrisCommand";

/**
 * Registers the Tetris mini-app extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerTetrisExtension(pi: ExtensionAPI): void {
	registerTetrisCommand(pi);
}
