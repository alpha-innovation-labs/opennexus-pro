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
 * User-editable Nexus configuration stored outside the app bundle.
 */
export type NexusUserConfig = {
	extensions?: Record<string, NexusUserExtensionConfig>;
	miniApps?: Record<string, Record<string, unknown>>;
	packages?: NexusPackageSource[];
};
