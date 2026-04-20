import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerAnnotateExtension } from "../extensions/annotate/registerAnnotateExtension.js";
import { registerCmuxExtension } from "../extensions/cmux/registerCmuxExtension.js";
import { registerExitMessageExtension } from "../extensions/exit-message/registerExitMessageExtension.js";
import registerNeoEditorExtension from "../extensions/neo-editor/registerNeoEditorExtension.js";
import { registerNotifyExtension } from "../extensions/notify/registerNotifyExtension.js";
import { registerObservationsExtension } from "../extensions/observations/registerObservationsExtension.js";
import { registerPlaygroundExtension } from "../extensions/playground/registerPlaygroundExtension.js";
import { registerStartupLogoExtension } from "../extensions/startup-logo/registerStartupLogoExtension.js";
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
    annotate: registerAnnotateExtension,
    cmux: registerCmuxExtension,
    "neo-editor": registerNeoEditorExtension,
    notify: registerNotifyExtension,
    observations: registerObservationsExtension,
    "exit-message": registerExitMessageExtension,
    "startup-logo": registerStartupLogoExtension,
    playground: registerPlaygroundExtension,
    "term-modal": registerTermModalExtension,
    todo: registerTodoExtension,
    tron: registerTronExtension,
    workspace: registerWorkspaceExtension,
  };
}
