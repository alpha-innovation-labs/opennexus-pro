import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";

type AssistantMessageUpdateHook = (component: AssistantMessageComponent, message: unknown) => void;

const assistantMessagePrototype = AssistantMessageComponent.prototype as AssistantMessageComponent & {
  updateContent(message: unknown): void;
};
const originalUpdateContent = assistantMessagePrototype.updateContent;
let currentAssistantMessageUpdateHook: AssistantMessageUpdateHook | undefined;
let assistantMessageHookInstalled = false;

/**
 * Installs the assistant-message hook bridge exactly once.
 */
function installAssistantMessageHookBridge(): void {
  if (assistantMessageHookInstalled) {
    return;
  }

  assistantMessagePrototype.updateContent = function updateContentWithHook(message: unknown): void {
    if (currentAssistantMessageUpdateHook) {
      currentAssistantMessageUpdateHook(this, message);
      return;
    }
    originalUpdateContent.call(this, message);
  };
  assistantMessageHookInstalled = true;
}

/**
 * Sets the assistant-message update hook used by Tron.
 *
 * @param hook Hook callback, or undefined to restore default rendering.
 */
export function setAssistantMessageUpdateHook(hook: AssistantMessageUpdateHook | undefined): void {
  installAssistantMessageHookBridge();
  currentAssistantMessageUpdateHook = hook;
}
