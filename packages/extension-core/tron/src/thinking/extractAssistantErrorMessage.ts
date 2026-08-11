/**
 * Decodes one JSON string fragment captured from a provider error payload.
 *
 * @param value Encoded JSON string contents without the outer quotes.
 * @returns Decoded text when the fragment is valid JSON, otherwise undefined.
 */
function decodeJsonStringFragment(value: string): string | undefined {
	try {
		return JSON.parse(`"${value}"`) as string;
	} catch {
		return undefined;
	}
}

/**
 * Extracts one nested message field from a raw provider error payload using regex fallback.
 *
 * @param errorMessage Raw provider error text.
 * @returns Extracted message field when present.
 */
function extractMessageField(errorMessage: string): string | undefined {
	const nestedErrorMatch = errorMessage.match(
		/"error"\s*:\s*\{[\s\S]*?"message"\s*:\s*"((?:\\.|[^"\\])*)"/,
	);
	if (nestedErrorMatch?.[1]) {
		return decodeJsonStringFragment(nestedErrorMatch[1])?.trim();
	}

	const topLevelMatch = errorMessage.match(
		/"message"\s*:\s*"((?:\\.|[^"\\])*)"/,
	);
	if (topLevelMatch?.[1]) {
		return decodeJsonStringFragment(topLevelMatch[1])?.trim();
	}

	return undefined;
}

/**
 * Extracts the user-facing provider error text from one raw assistant error payload.
 *
 * @param errorMessage Raw provider error text.
 * @returns The nested JSON message when present, otherwise the trimmed raw text.
 */
export function extractAssistantErrorMessage(errorMessage: string): string {
	const trimmedMessage = errorMessage.trim();
	const jsonStartIndex = trimmedMessage.indexOf("{");

	if (jsonStartIndex === -1) {
		return trimmedMessage;
	}

	try {
		const parsed = JSON.parse(trimmedMessage.slice(jsonStartIndex)) as {
			message?: unknown;
			error?: { message?: unknown };
		};
		const nestedMessage =
			typeof parsed.error?.message === "string"
				? parsed.error.message
				: typeof parsed.message === "string"
					? parsed.message
					: undefined;

		return (
			nestedMessage?.trim() ||
			extractMessageField(trimmedMessage) ||
			trimmedMessage
		);
	} catch {
		return extractMessageField(trimmedMessage) || trimmedMessage;
	}
}
