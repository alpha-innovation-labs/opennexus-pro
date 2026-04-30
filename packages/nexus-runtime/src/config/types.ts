/**
 * Per-extension user preference persisted in the Nexus user config.
 */
export type NexusUserExtensionConfig = {
	enabled?: boolean;
};

/**
 * User-editable Nexus configuration stored outside the app bundle.
 */
export type NexusUserConfig = {
	extensions?: Record<string, NexusUserExtensionConfig>;
};
