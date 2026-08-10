import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { LocalImageReaderConfig } from "../config/types";
import { LOCAL_IMAGE_READER_PARAMS } from "../config/schema";
import { encodeImageToBase64 } from "../image/encoder";
import { buildMessages, buildRequestBody, buildToolResult } from "../request/builder";
import { makeApiRequest, handleApiError } from "../request/executor";

/**
 * Register the local_image_reader tool with the Pi extension API.
 *
 * @param pi - The Pi extension API.
 * @param getConfig - A function that resolves and caches configuration.
 */
export function registerLocalImageTool(
  pi: ExtensionAPI,
  getConfig: (ctx: ExtensionContext) => LocalImageReaderConfig,
): void {
  pi.registerTool({
    name: "local_image_reader",
    label: "Local Image Reader",
    description:
      "Send a local image file and a query to an OpenAI-compatible multimodal endpoint. Returns structured JSON with the model's text response and token usage.",
    promptSnippet:
      "Send an image to a multimodal model and get a structured response with token counts",
    promptGuidelines: [
      "Use local_image_reader when the user asks to analyze, describe, or extract information from an image file.",
      "Always provide the full absolute path to the image file.",
      "The response is structured JSON — extract the content field for the model's text answer.",
    ],
    parameters: LOCAL_IMAGE_READER_PARAMS,
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      try {
        // Load configuration from user config.
        const config = getConfig(ctx);

        // Encode the image to base64.
        const imageBase64 = encodeImageToBase64(params.imagePath);

        // Build the chat completion request.
        const messages = buildMessages(imageBase64, params.query);
        const requestBody = buildRequestBody(config, messages);

        // Make the HTTP POST request.
        const result = await makeApiRequest(
          config.url,
          config,
          JSON.stringify(requestBody),
          signal ?? ctx.signal,
        );

        return result;
      } catch (err) {
        return handleApiError(err);
      }
    },
  });
}
