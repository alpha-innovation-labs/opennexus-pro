import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerTetrisCommand } from "./command/registerTetrisCommand.js";

/**
 * Registers the Tetris mini-app extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerTetrisExtension(pi: ExtensionAPI): void {
	registerTetrisCommand(pi);
}
