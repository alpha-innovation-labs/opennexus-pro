import type { StoredObservationMessage } from "@extensions/observations";

/**
 * Formats stored messages as XML-like blocks for the observation recreation prompt.
 *
 * @param messages Stored messages in chronological order.
 * @returns Formatted message history.
 */
export function formatObservationRecreationMessages(
	messages: readonly StoredObservationMessage[],
): string {
	return messages
		.map((message) =>
			[
				`<message index="${message.index}" role="${message.role}">`,
				message.thinking
					? `<thinking>${message.thinking}</thinking>`
					: undefined,
				`<text>${message.text}</text>`,
				"</message>",
			]
				.filter(Boolean)
				.join("\n"),
		)
		.join("\n\n");
}
