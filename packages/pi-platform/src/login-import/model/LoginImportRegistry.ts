import type { AuthStorage } from "@earendil-works/pi-coding-agent";

export type LoginImportModelRegistry = {
	readonly authStorage: AuthStorage;
	getAll(): ReadonlyArray<{ readonly provider: string }>;
	refresh(): void;
};
