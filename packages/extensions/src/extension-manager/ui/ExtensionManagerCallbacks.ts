import type { ManagedExtensionRow } from "../model/types.js";

/**
 * Side-effect callbacks used by the extension manager modal.
 */
export type ExtensionManagerCallbacks = {
	onUpdate?: (extensionId: string, enabled: boolean) => ManagedExtensionRow[];
	onInstallPackage?: (source: string) => Promise<ManagedExtensionRow[]>;
	onRemovePackage?: (source: string) => Promise<ManagedExtensionRow[]>;
	onUpdatePackage?: (source: string) => Promise<ManagedExtensionRow[]>;
	onSearchPackages?: (query: string, rows: ManagedExtensionRow[]) => Promise<ManagedExtensionRow[]>;
};
