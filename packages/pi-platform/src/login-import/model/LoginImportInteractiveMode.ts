import type { TUI } from "@earendil-works/pi-tui";
import type { LoginImportModelRegistry } from "./LoginImportRegistry.js";

export type LoginImportInteractiveMode = {
	readonly ui: TUI;
	readonly session: { readonly modelRegistry: LoginImportModelRegistry };
	readonly footer?: { invalidate(): void };
	showStatus(message: string): void;
	showError(message: string): void;
	updateAvailableProviderCount(): Promise<void>;
	updateEditorBorderColor(): void;
};
