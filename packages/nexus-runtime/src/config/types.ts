/**
 * Per-extension user preference persisted in the Nexus user config.
 */
export type NexusUserExtensionConfig = {
	enabled?: boolean;
};

/**
 * Nexus/Pi package source persisted in settings.
 */
export type NexusPackageSource = string | { source: string; extensions?: string[]; skills?: string[]; prompts?: string[]; themes?: string[] };

/**
 * Configuration for the local-image-reader extension.
 */
export type LocalImageReaderConfig = {
	/** The API endpoint URL for chat completions. */
	url: string;
	/** The API key for authentication. */
	apiKey: string;
	/** The model identifier to use. Optional — can be selected dynamically via the API. */
	model?: string;
	/** Optional maximum number of tokens for the response. */
	maxTokens?: number;
};

/**
 * Per-feature-flag user override persisted in the Nexus user config.
 */
export type UserFeatureFlagOverride = {
	/** Override whether this feature flag is enabled. */
	enabled?: boolean;
	/** Override whether this feature flag is development-only. */
	devOnly?: boolean;
};

/**
 * User-editable Nexus configuration stored outside the app bundle.
 */
export type NexusUserConfig = {
	extensions?: Record<string, NexusUserExtensionConfig>;
	miniApps?: Record<string, Record<string, unknown>>;
	packages?: NexusPackageSource[];
	/** Per-extension settings persisted in the user config file. */
	localImageReader?: LocalImageReaderConfig;
	/** Whether desktop notifications are enabled. */
	notifyEnabled?: boolean;
	/** Per-feature-flag overrides from the user config file. */
	featureFlags?: Record<string, UserFeatureFlagOverride>;
};
