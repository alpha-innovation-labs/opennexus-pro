import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerKanbanCommand } from "./command/registerKanbanCommand.js";

/**
 * Registers the kanban extension surface.
 *
 * @param pi Pi extension API.
 */
export function registerKanbanExtension(pi: ExtensionAPI): void {
	registerKanbanCommand(pi);
}
