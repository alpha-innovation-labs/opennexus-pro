/**
 * Connection configuration for a single LLM provider.
 *
 * Stored in `~/.config/nexus/config.json` under the `providers` key.
 */
export type ProviderConfig = {
	/** The hostname where the provider server runs (default: "localhost"). */
	host: string;
	/** The TCP port the provider server listens on. */
	port: number;
	/** API key required by the provider (optional — not all providers need one). */
	api_key?: string;
	/** Whether the provider is enabled. Defaults to true. */
	enabled?: boolean;
	/** Optional path prefix for API endpoints (e.g. "/v1" for Ollama). */
	apiPath?: string;
};

/**
 * Map of configured providers keyed by provider ID.
 *
 * Example: `{ ollama: { host: "localhost", port: 11434, enabled: true } }`
 */
export type ProvidersConfig = Record<string, ProviderConfig>;
