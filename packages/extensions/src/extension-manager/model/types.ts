/**
 * Extension source shown in the extension manager.
 */
export type ManagedExtensionKind = "core" | "user";

/**
 * Runtime status shown for an installed extension.
 */
export type ManagedExtensionStatus = "enabled" | "disabled";

/**
 * Row rendered by the extension manager modal.
 */
export type ManagedExtensionRow = {
	id: string;
	kind: ManagedExtensionKind;
	status: ManagedExtensionStatus;
	features: string[];
};

/**
 * Visible tab in the extension manager modal.
 */
export type ExtensionManagerTab = "all" | "core" | "user";
