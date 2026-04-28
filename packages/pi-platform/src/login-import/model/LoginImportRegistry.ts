import type { AuthStorage } from "@mariozechner/pi-coding-agent";

export type LoginImportModelRegistry = {
	readonly authStorage: AuthStorage;
	getAll(): ReadonlyArray<{ readonly provider: string }>;
	refresh(): void;
};
