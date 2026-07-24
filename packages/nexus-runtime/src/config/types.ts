

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
 * Users write a plain boolean: `false` to disable, omit or `true` to enable.
 */
export type UserFeatureFlagOverride = boolean;

/**
 * Per-package enable/disable overlay persisted in config.json.
 * Key is the package source string (e.g. "npm:pi-chrome"), value is the enabled state.
 */
export type PiPackagesMap = Record<string, boolean>;

/**
 * User-editable Nexus configuration stored outside the app bundle.
 */
export type NexusUserConfig = {
	/** Per-package enable/disable overlay, nested under extensions. */
	extensions?: {
		/** Key is the package source string (e.g. "npm:pi-chrome"), value is the enabled state. */
		pi_packages?: PiPackagesMap;
	};
	miniApps?: Record<string, Record<string, unknown>>;
	packages?: NexusPackageSource[];
	/** Per-extension settings persisted in the user config file. */
	localImageReader?: LocalImageReaderConfig;
	/** Whether desktop notifications are enabled. */
	notifyEnabled?: boolean;
	/** Per-feature-flag overrides from the user config file. */
	featureFlags?: Record<string, UserFeatureFlagOverride>;
}
	/** Provider toggle states persisted in the user config file.
	 * Key is the provider id (e.g. "minimax", "anthropic"), value is { enabled: boolean }.
	 * `true` means the provider is toggled on (green), `false` means off (default color).
	 */
	providers?: Record<string, { enabled: boolean }>;
;
