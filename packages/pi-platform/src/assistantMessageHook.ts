import type { AssistantMessage } from "@earendil-works/pi-ai";
import { AssistantMessageComponent } from "@earendil-works/pi-coding-agent";

type AssistantMessageUpdateHook = (
	component: AssistantMessageComponent,
	message: AssistantMessage | undefined,
) => void;

const assistantMessagePrototype =
	AssistantMessageComponent.prototype as AssistantMessageComponent & {
		updateContent(message: AssistantMessage, isStreaming?: boolean): void;
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

	assistantMessagePrototype.updateContent = function updateContentWithHook(
		message: AssistantMessage,
		isStreaming?: boolean,
	): void {
		if (currentAssistantMessageUpdateHook) {
			currentAssistantMessageUpdateHook(this, message);
			return;
		}
		originalUpdateContent.call(this, message, isStreaming);
	};
	assistantMessageHookInstalled = true;
}

/**
 * Sets the assistant-message update hook used by Tron.
 *
 * @param hook Hook callback, or undefined to restore default rendering.
 */
export function setAssistantMessageUpdateHook(
	hook: AssistantMessageUpdateHook | undefined,
): void {
	installAssistantMessageHookBridge();
	currentAssistantMessageUpdateHook = hook;
}
