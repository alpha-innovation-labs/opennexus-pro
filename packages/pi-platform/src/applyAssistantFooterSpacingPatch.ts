import { InteractiveMode } from "@earendil-works/pi-coding-agent";
import { Spacer } from "@earendil-works/pi-tui";

/**
 * Flag set on an AssistantMessageComponent when Tron renders its duration
 * footer ("Nexus dev · 17s"). The footer hugs its content box and must not
 * leave a blank line between itself and the following user bubble.
 */
export const NEXUS_TRON_ASSISTANT_FOOTER_FLAG = "__nexusTronAssistantFooter__";

type ChatContainer = {
	children: unknown[];
	removeChild(child: unknown): void;
};

type InteractiveModeWithFooterSpacing = {
	chatContainer: ChatContainer;
	ui: { requestRender(): void };
	addMessageToChat(message: unknown, options?: unknown): void;
};

type InteractiveModePrototypeWithFooterSpacing = {
	__nexusAssistantFooterSpacingPatched__?: boolean;
	addMessageToChat(message: unknown, options?: unknown): void;
};

/**
 * Removes Pi's leading spacer for a user message that directly follows an
 * assistant message that rendered the Tron duration footer.
 *
 * Pi adds a `Spacer(1)` before every non-first user message. That spacer is the
 * only visual separator between the footer and the following prompt bubble, so
 * it leaves a blank line under the footer. When the previous assistant message
 * rendered the footer, drop that spacer so the bubble sits directly under it.
 */
export function applyAssistantFooterSpacingPatch(): void {
	const prototype =
		InteractiveMode.prototype as unknown as InteractiveModePrototypeWithFooterSpacing;
	if (prototype.__nexusAssistantFooterSpacingPatched__) return;

	const originalAddMessageToChat = prototype.addMessageToChat;
	prototype.addMessageToChat = function addMessageToChatTightAfterFooter(
		this: InteractiveModeWithFooterSpacing,
		message: unknown,
		options?: unknown,
	): void {
		originalAddMessageToChat.call(this, message, options);
		if ((message as { role?: string })?.role !== "user") return;

		const children = this.chatContainer.children;
		const bubble = children[children.length - 1];
		const spacer = children[children.length - 2];
		const previous = children[children.length - 3];
		if (
			spacer instanceof Spacer &&
			previous &&
			(previous as Record<string, unknown>)[
				NEXUS_TRON_ASSISTANT_FOOTER_FLAG
			] === true
		) {
			this.chatContainer.removeChild(spacer);
			if (bubble !== undefined) this.ui.requestRender();
		}
	};

	prototype.__nexusAssistantFooterSpacingPatched__ = true;
}
