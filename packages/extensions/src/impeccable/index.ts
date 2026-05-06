import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerImpeccableCommand } from "./command/registerImpeccableCommand.js";

/**
 * Registers the bundled Impeccable extension surface.
 *
 * Frontend design assistance via /impeccable slash commands:
 * - craft, shape, teach, document, extract
 * - critique, audit, polish
 * - bolder, quieter, distill, harden, onboard
 * - animate, colorize, typeset, layout, delight, overdrive
 * - clarify, adapt, optimize
 * - live: Interactive visual variant mode with browser element selection
 *
 * @param pi Pi extension API.
 */
export default function registerImpeccableExtension(pi: ExtensionAPI): void {
	registerImpeccableCommand(pi);
}