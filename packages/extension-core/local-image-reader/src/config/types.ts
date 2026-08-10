/**
 * Configuration interface for the local-image-reader extension.
 */

export interface LocalImageReaderConfig {
  /** The API endpoint URL for chat completions. */
  url: string;
  /** The API key for authentication. */
  apiKey: string;
  /** The model identifier to use. Optional — can be selected dynamically via the API. */
  model?: string;
  /** Optional maximum number of tokens for the response. */
  maxTokens?: number;
}
