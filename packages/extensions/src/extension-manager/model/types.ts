/**
 * Extension source shown in the extension manager.
 */
export type ManagedExtensionKind = "core" | "third-party";

/**
 * Runtime status shown for an installed extension.
 */
export type ManagedExtensionStatus = "enabled" | "disabled" | "available";

/**
 * Row rendered by the extension manager modal.
 */
export type ManagedExtensionRow = {
	id: string;
	kind: ManagedExtensionKind;
	status: ManagedExtensionStatus;
	features: string[];
	rowType?: "extension" | "package" | "search";
	source?: string;
	scope?: "user" | "project";
	location?: string;
	repository?: string;
};

/**
 * Visible tab in the extension manager modal.
 */
export type ExtensionManagerTab = "all" | "core" | "third-party";
