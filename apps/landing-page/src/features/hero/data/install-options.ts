import type { InstallOption } from "../types/install-option";

/** Package-manager install commands shown in the hero install block. */
export const installOptions: readonly InstallOption[] = [
	{
		id: "npm",
		label: "npm",
		command: "npm install -g opennexus",
	},
	{
		id: "bun",
		label: "bun",
		command: "bun add -g opennexus",
	},
	{
		id: "pnpm",
		label: "pnpm",
		command: "pnpm add -g opennexus",
	},
];
