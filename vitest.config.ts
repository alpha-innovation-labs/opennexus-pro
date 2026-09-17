import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^@nexus\/observability\/(.*)$/,
				replacement: `${root("./packages/observability/src/")}$1`,
			},
			{
				find: /^@nexus\/pi-platform\/(.*)$/,
				replacement: `${root("./packages/pi-platform/src/")}$1`,
			},
		],
	},
	test: {
		include: ["test/**/*.test.ts"],
		testTimeout: 120_000,
		hookTimeout: 120_000,
	},
});
