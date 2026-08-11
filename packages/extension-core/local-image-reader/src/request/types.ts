/**
 * Request body for a chat completions API call.
 */
export interface ChatCompletionRequest {
	model?: string;
	messages: Array<{
		role: "system" | "user" | "assistant";
		content: string | Array<{ type: string; [key: string]: unknown }>;
	}>;
	max_tokens?: number;
	stream?: boolean;
}

/**
 * Response from a chat completions API call.
 */
export interface ChatCompletionResponse {
	id: string;
	model: string;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
	choices: Array<{
		message: {
			role: string;
			content: string | null;
		};
	}>;
}

/**
 * Structured result returned by the local_image_reader tool.
 */
export interface ToolResult {
	model: string;
	content: string;
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: string;
}
