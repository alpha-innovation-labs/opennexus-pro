import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	resolve: {
		alias: [
			// Match workspace source aliases used by the actual Neo editor in TUI tests.
			{ find: /^@extensions\/([^/]+)\/(.*)$/, replacement: `${root("./packages/extension-core/")}$1/src/$2` },
			{ find: /^@extensions\/([^/]+)$/, replacement: `${root("./packages/extension-core/")}$1/src/index.ts` },
			{ find: /^@nexus\/(mini-apps|herdr)\/(.*)$/, replacement: `${root("./packages/")}$1/src/$2` },
			{ find: /^@nexus\/(mini-apps|herdr)$/, replacement: `${root("./packages/")}$1/src/index.ts` },
			{ find: /^@nexus\/runtime\/(.*)$/, replacement: `${root("./packages/nexus-runtime/src/")}$1` },
			{ find: /^@nexus\/feature-flags\/(.*)$/, replacement: `${root("./packages/feature-flags/src/")}$1` },
			{
				find: /^@nexus\/observability\/(.*)$/,
				replacement: `${root("./packages/observability/src/")}$1`,
			},
			{
				find: /^@nexus\/pi-platform\/(.*)$/,
				replacement: `${root("./packages/pi-platform/src/")}$1`,
			},
			{
				find: /^@nexus\/tui-kit\/(.*)$/,
				replacement: `${root("./packages/tui-kit/src/")}$1`,
			},
		],
	},
	test: {
		include: ["test/**/*.test.ts"],
		testTimeout: 120_000,
		hookTimeout: 120_000,
	},
});
