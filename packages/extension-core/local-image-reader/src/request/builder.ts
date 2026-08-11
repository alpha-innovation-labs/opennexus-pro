import type { LocalImageReaderConfig } from "../config/types";
import { DEFAULT_SYSTEM_PROMPT } from "../constants";
import type {
	ChatCompletionRequest,
	ChatCompletionResponse,
	ToolResult,
} from "./types";

/**
 * Build the messages array for a multimodal chat completion request.
 * Includes the hard-coded system prompt and a user message with image + text.
 *
 * @param imageBase64 - A data URI string containing the base64-encoded image.
 * @param query - The user's text query about the image.
 * @returns The messages array ready to be sent to the API.
 */
export function buildMessages(
	imageBase64: string,
	query: string,
): ChatCompletionRequest["messages"] {
	const messages: ChatCompletionRequest["messages"] = [];

	// Hard-coded system prompt (describe only, no interpretation)
	messages.push({ role: "system", content: DEFAULT_SYSTEM_PROMPT });

	// User message with image + text query
	messages.push({
		role: "user",
		content: [
			{ type: "image_url", image_url: { url: imageBase64 } },
			{ type: "text", text: query },
		],
	});

	return messages;
}

/**
 * Build the request body for a chat completions API call.
 *
 * @param config - The local-image-reader configuration.
 * @param messages - The messages array to include in the request.
 * @returns A complete ChatCompletionRequest body ready for JSON serialization.
 */
export function buildRequestBody(
	config: LocalImageReaderConfig,
	messages: ChatCompletionRequest["messages"],
): ChatCompletionRequest {
	const requestBody: ChatCompletionRequest = {
		messages,
		stream: false,
	};

	// Only set model if configured — omitting it lets the API use its default.
	if (config.model) {
		requestBody.model = config.model;
	}

	if (config.maxTokens) {
		requestBody.max_tokens = config.maxTokens;
	}

	return requestBody;
}

/**
 * Parse an API response and build a structured ToolResult.
 *
 * @param data - The parsed JSON response from the chat completions API.
 * @returns A ToolResult suitable for returning from the tool's execute function.
 */
export function buildToolResult(data: ChatCompletionResponse): ToolResult {
	const choice = data.choices?.[0];
	const content = choice?.message?.content ?? "";

	return {
		model: data.model,
		content: typeof content === "string" ? content : "",
		prompt_tokens: data.usage?.prompt_tokens ?? 0,
		completion_tokens: data.usage?.completion_tokens ?? 0,
		total_tokens: String(data.usage?.total_tokens ?? 0),
	};
}
