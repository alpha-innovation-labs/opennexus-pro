/**
 * Extension source shown in the Pi packages.
 */
export type ManagedExtensionKind = "core" | "third-party";

/**
 * Runtime status shown for an installed extension.
 */
export type ManagedExtensionStatus = "enabled" | "disabled" | "available";

/**
 * Row rendered by the Pi packages modal.
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
 * Visible tab in the Pi packages modal.
 */
export type PiPackagesTab = "all" | "third-party";
