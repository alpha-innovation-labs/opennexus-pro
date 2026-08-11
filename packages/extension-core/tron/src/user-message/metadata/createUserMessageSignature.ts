import { getUserMessageTextFromMessage } from "./getUserMessageTextFromMessage";

/**
 * Creates a matching signature for a user message.
 *
 * @param message User message-like object.
 * @returns Signature containing timestamp and text.
 */
export function createUserMessageSignature(message: { timestamp?: number; role?: string; content?: string | { type?: string; text?: string }[] }): string {
	return `${message?.timestamp ?? ""}\n${getUserMessageTextFromMessage(message)}`;
}
