import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import registerNeoEditorExtension from "../extensions/neo-editor/registerNeoEditorExtension.js";
import { registerObservationsExtension } from "../extensions/observations/registerObservationsExtension.js";
import { registerPlaygroundExtension } from "../extensions/playground/registerPlaygroundExtension.js";
import { registerTermModalExtension } from "../extensions/term-modal/registerTermModalExtension.js";
import { registerTodoExtension } from "../extensions/todo/registerTodoExtension.js";
import registerTronExtension from "../extensions/tron/index.js";
import { registerWorkspaceExtension } from "../extensions/workspace/registerWorkspaceExtension.js";

/**
 * Creates the code-backed extension registration map.
 *
 * @returns Extension registration map by id.
 */
export function createExtensionRegisterMap(): Record<string, (pi: ExtensionAPI) => void> {
  return {
    "neo-editor": registerNeoEditorExtension,
    observations: registerObservationsExtension,
    playground: registerPlaygroundExtension,
    "term-modal": registerTermModalExtension,
    todo: registerTodoExtension,
    tron: registerTronExtension,
    workspace: registerWorkspaceExtension,
  };
}
