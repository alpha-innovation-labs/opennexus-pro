import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerImpeccableCommand } from "./command/registerImpeccableCommand.js";

let activeCtx: ExtensionContext | undefined;

/**
 * Impeccable extension for frontend design assistance.
 * 
 * This extension registers the /impeccable slash command which provides:
 * - craft: Shape then build a feature end-to-end
 * - shape: Plan UX/UI before writing code
 * - teach: Set up PRODUCT.md and DESIGN.md context
 * - live: Interactive visual variant mode with browser element selection
 * - And many more design refinement commands
 */
export default async function registerImpeccableExtension(pi: ExtensionAPI): Promise<void> {
	activeCtx = pi.context;
	registerImpeccableCommand(pi);
}

/**
 * Get the active extension context.
 */
export function getActiveContext(): ExtensionContext | undefined {
	return activeCtx;
}