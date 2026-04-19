import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import registerNeoEditorExtension from "./neo-editor/registerNeoEditorExtension.js";
import { registerObservationsExtension } from "./observations/registerObservationsExtension.js";
import { registerPlaygroundExtension } from "./playground/registerPlaygroundExtension.js";
import { registerTermModalExtension } from "./term-modal/registerTermModalExtension.js";
import { registerTodoExtension } from "./todo/registerTodoExtension.js";
import registerTronExtension from "./tron/index.js";
import { registerWorkspaceExtension } from "./workspace/registerWorkspaceExtension.js";

/**
 * Central extension entrypoint.
 *
 * @param pi Pi extension API.
 */
export default function index(pi: ExtensionAPI): void {
	registerNeoEditorExtension(pi);
	registerPlaygroundExtension(pi);
	registerTermModalExtension(pi);
	registerTodoExtension(pi);
	registerObservationsExtension(pi);
	registerTronExtension(pi);
	registerWorkspaceExtension(pi);
}
