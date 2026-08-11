import type { LocalImageReaderConfig } from "../config/types";
import { buildToolResult } from "./builder";
import type { ChatCompletionResponse } from "./types";

/**
 * Make an HTTP POST request to a chat completions API endpoint.
 * Handles error responses, parsing, and structured result building.
 *
 * @param url - The API endpoint URL (may or may not include path).
 * @param config - The local-image-reader configuration.
 * @param requestBody - The serialized request body.
 * @param signal - Optional AbortSignal for cancellation.
 * @returns A tool result object with the model's response and token usage.
 */
export async function makeApiRequest(
	url: string,
	config: LocalImageReaderConfig,
	requestBody: string,
	signal?: AbortSignal,
): Promise<{
	content: Array<{ type: "text"; text: string }>;
	details: { isError?: boolean; model?: string; tokens?: string };
}> {
	// Normalize URL to always target /v1/chat/completions.
	// Config url may be a bare host ("http://localhost:4000")
	// or already include the path ("http://localhost:4000/v1/chat/completions").
	const hasV1Path = /\/v1\//.test(url);
	const endpointUrl = hasV1Path ? url : `${url}/v1/chat/completions`;
	const response = await fetch(endpointUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${config.apiKey}`,
		},
		body: requestBody,
		signal,
	});

	// Handle non-OK responses
	if (!response.ok) {
		let errorBody: string;
		try {
			const errJson = await response.json();
			errorBody =
				typeof errJson.error?.message === "string"
					? errJson.error.message
					: JSON.stringify(errJson);
		} catch {
			errorBody = `HTTP ${response.status} ${response.statusText}`;
		}
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							error: `API request failed with status ${response.status}`,
							message: errorBody,
							status: response.status,
						},
						null,
						2,
					),
				},
			],
			details: { isError: true },
		};
	}

	// Parse and build structured result
	const data: ChatCompletionResponse = await response.json();
	const result = buildToolResult(data);

	return {
		content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
		details: { model: result.model, tokens: result.total_tokens },
	};
}

/**
 * Fetch the list of available models from the API.
 * Tries GET /v1/models first (OpenAI-compatible standard),
 * falls back to POST with an empty messages array.
 *
 * @param url - The API endpoint URL.
 * @param apiKey - The API key for authentication.
 * @param signal - Optional AbortSignal for cancellation.
 * @returns An array of model ID strings, or an error object.
 */
export async function fetchModels(
	url: string,
	apiKey: string,
	signal?: AbortSignal,
): Promise<{
	models: string[];
	error?: string;
}> {
	// Derive the models endpoint from the completions URL.
	// If URL has no path (e.g. "http://localhost:4000"), append /v1/models.
	// Otherwise replace /v1/chat/completions… with /v1/models.
	const hasV1Path = /\/v1\//.test(url);
	const modelsUrl = hasV1Path
		? url.replace(/\/v1\/chat\/completions.*$/, "/v1/models")
		: `${url}/v1/models`;
	const completionsUrl = hasV1Path ? url : `${url}/v1/chat/completions`;

	// Strategy 1: GET /v1/models (OpenAI standard)
	try {
		const response = await fetch(modelsUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			signal,
		});

		if (response.ok) {
			const data: { data?: Array<{ id: string }> } = await response.json();
			if (data.data && Array.isArray(data.data)) {
				return { models: data.data.map((m) => m.id) };
			}
		}
	} catch {
		// Fall through to strategy 2
	}

	// Strategy 2: POST with empty messages (some providers support this)
	try {
		const response = await fetch(completionsUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({ messages: [], stream: false }),
		});

		if (response.ok) {
			const data: { models?: string[] } = await response.json();
			if (data.models && Array.isArray(data.models)) {
				return { models: data.models };
			}
		}
	} catch {
		// Fall through to error
	}

	return {
		models: [],
		error: "Could not fetch models. Check URL and API key.",
	};
}

/**
 * Handle a caught error and return a structured error response.
 * Categorizes errors by type (file_not_found, config_error, network_error).
 *
 * @param err - The caught error.
 * @returns A structured error result object.
 */
export function handleApiError(err: unknown): {
	content: Array<{ type: "text"; text: string }>;
	details: { isError: boolean };
} {
	const message = err instanceof Error ? err.message : String(err);

	// Categorize common errors
	let category = "unknown";
	if (message.includes("not found") || message.includes("ENOENT")) {
		category = "file_not_found";
	} else if (
		message.includes("Config") ||
		message.includes("missing required")
	) {
		category = "config_error";
	} else if (
		message.includes("fetch") ||
		message.includes("NetworkError") ||
		message.includes("ECONNREFUSED")
	) {
		category = "network_error";
	}

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(
					{
						error: true,
						category,
						message,
					},
					null,
					2,
				),
			},
		],
		details: { isError: true },
	};
}
