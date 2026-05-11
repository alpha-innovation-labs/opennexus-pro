import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerTodoExtension from "./index.js";

export { registerTodoExtension };
export default registerTodoExtension;

/**
 * Registers the Nexus todo tool, slash command, and live todo overlay.
 *
 * @param pi Pi extension API.
 */
export function registerNexusTodoExtension(pi: ExtensionAPI): void {
	registerTodoExtension(pi);
}
