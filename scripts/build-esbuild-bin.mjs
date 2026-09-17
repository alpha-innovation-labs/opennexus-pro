/**
 * Build a single bundled JS file using esbuild.
 *
 * esbuild compiles TypeScript directly to JavaScript and bundles it
 * into one file. No separate tsc step is needed.
 *
 * Strategy:
 * 1. Bundle everything in (no external packages).
 * 2. Externalize only Node.js built-in modules.
 * 3. Handle dynamic require() calls for node builtins.
 */

import { existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { build } from "esbuild";
import { generatePackageInfo } from "./auto-update/generatePackageInfo.mjs";

const ROOT = resolve(import.meta.dirname, "..");

const ENTRY = resolve(ROOT, "apps/tui/src/index.ts");
const OUTPUT = resolve(ROOT, "dist/apps/tui/bundled/index.js");

// Node.js built-in modules to externalize
const NODE_MODULES = [
	"child_process",
	"node:child_process",
	"node:os",
	"node:path",
	"node:tty",
	"node:fs",
	"node:fs/promises",
	"node:crypto",
	"node:events",
	"node:stream",
	"node:url",
	"node:util",
	"node:buffer",
	"node:process",
	"node:readline",
	"node:net",
	"node:dns",
	"node:http",
	"node:https",
	"node:zlib",
	"node:assert",
	"node:v8",
	"node:vm",
	"node:inspector",
	"node:perf_hooks",
	"node:timers",
	"node:worker_threads",
	"node:console",
	"node:diagnostics_channel",
];

// Workspace packages to bundle in (point to source)
const ALIASES = {
	"@nexus/pi-platform": resolve(ROOT, "packages/pi-platform/src/index.ts"),
	"@nexus/pi-platform/config": resolve(
		ROOT,
		"packages/pi-platform/src/config.ts",
	),
	"@nexus/runtime": resolve(ROOT, "packages/nexus-runtime/src/index.ts"),
	"@nexus/mini-apps": resolve(ROOT, "packages/mini-apps/src/index.ts"),
	"@nexus/observability": resolve(ROOT, "packages/observability/src/index.ts"),
	"@nexus/herdr": resolve(ROOT, "packages/herdr/src/index.ts"),
	"@nexus/feature-flags": resolve(ROOT, "packages/feature-flags/src/index.ts"),
	"@nexus/tui-kit": resolve(ROOT, "packages/tui-kit/src/index.ts"),
	"@extensions/ai-providers": resolve(
		ROOT,
		"packages/extension-core/ai-providers/src/index.ts",
	),
	"@extensions/auto-update": resolve(
		ROOT,
		"packages/extension-core/auto-update/src/index.ts",
	),
	"@extensions/cmux": resolve(
		ROOT,
		"packages/extension-core/cmux/src/index.ts",
	),
	"@extensions/context-usage": resolve(
		ROOT,
		"packages/extension-core/context-usage/src/index.ts",
	),
	"@extensions/exit-message": resolve(
		ROOT,
		"packages/extension-core/exit-message/src/index.ts",
	),
	"@extensions/feature-management": resolve(
		ROOT,
		"packages/extension-core/feature-management/src/index.ts",
	),
	"@extensions/fff": resolve(ROOT, "packages/extension-core/fff/src/index.ts"),
	"@extensions/herdr-agent-end-log": resolve(
		ROOT,
		"packages/extension-core/herdr-agent-end-log/src/index.ts",
	),
	"@extensions/hotkeys": resolve(
		ROOT,
		"packages/extension-core/hotkeys/src/index.ts",
	),
	"@extensions/local-image-reader": resolve(
		ROOT,
		"packages/extension-core/local-image-reader/src/index.ts",
	),
	"@extensions/neo-editor": resolve(
		ROOT,
		"packages/extension-core/neo-editor/src/index.ts",
	),
	"@extensions/notify": resolve(
		ROOT,
		"packages/extension-core/notify/src/index.ts",
	),
	"@extensions/observations": resolve(
		ROOT,
		"packages/extension-core/observations/src/index.ts",
	),
	"@extensions/pi-packages": resolve(
		ROOT,
		"packages/extension-core/pi-packages/src/index.ts",
	),
	"@extensions/prompts": resolve(
		ROOT,
		"packages/extension-core/prompts/src/index.ts",
	),
	"@extensions/rtk": resolve(ROOT, "packages/extension-core/rtk/src/index.ts"),
	"@extensions/runtime": resolve(
		ROOT,
		"packages/extension-core/runtime/src/index.ts",
	),
	"@extensions/slash-menu": resolve(
		ROOT,
		"packages/extension-core/slash-menu/src/index.ts",
	),
	"@extensions/startup-hero": resolve(
		ROOT,
		"packages/extension-core/startup-hero/src/index.ts",
	),
	"@extensions/subagent-tintin": resolve(
		ROOT,
		"packages/extension-core/subagent-tintin/src/index.ts",
	),
	"@extensions/subagents": resolve(
		ROOT,
		"packages/extension-core/subagents/src/index.ts",
	),
	"@extensions/system-prompt": resolve(
		ROOT,
		"packages/extension-core/system-prompt/src/index.ts",
	),
	"@extensions/tron": resolve(
		ROOT,
		"packages/extension-core/tron/src/index.ts",
	),
	"@extensions/web-search": resolve(
		ROOT,
		"packages/extension-core/web-search/src/index.ts",
	),
};

function aliasPlugin(aliases) {
	const entries = Object.entries(aliases);
	const filterStr = entries
		.map(([k]) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|");
	const filter = new RegExp(`^(${filterStr})(/.+)?$`);

	return {
		name: "alias",
		setup(build) {
			build.onResolve({ filter }, (args) => {
				const aliasBase = entries.find(([k]) => args.path.startsWith(k));
				if (aliasBase) {
					// Strip the leading slash so the subpath is treated as relative
				// to the aliased package's source dir (path.resolve would otherwise
			// treat "/sub" as an absolute path and land on the filesystem root).
				const subPath = args.path.slice(aliasBase[0].length).replace(/^\/+/, "");
				const fullPath =
					subPath === ""
						? aliasBase[1]
						: resolve(dirname(aliasBase[1]), subPath);
					// Only treat an exact match as a file; a directory falls through
					// to the extension loop (which resolves ".../tools" -> ".../tools.ts"
					// or ".../tools/index.ts").
					if (existsSync(fullPath) && statSync(fullPath).isFile()) {
						return { path: fullPath };
					}
					for (const ext of [
						".ts",
						".tsx",
						".js",
						".jsx",
						"/index.ts",
						"/index.tsx",
						"/index.js",
						"/index.jsx",
					]) {
						const tryPath = fullPath + ext;
						if (existsSync(tryPath)) {
							return { path: tryPath };
						}
					}
				}
			});
		},
	};
}

async function main() {
	try {
		// Bake the current version into the auto-update extension before bundling.
		await generatePackageInfo();

		console.log("📦 Bundling with esbuild...");

		await build({
			entryPoints: [ENTRY],
			bundle: true,
			minify: true,
			platform: "node",
			format: "esm",
			target: "node20",
			outfile: OUTPUT,
			external: NODE_MODULES,
			// The bundle is ESM so import.meta.url works natively, but some bundled
		// CJS deps call require() at runtime. esbuild's CJS-require shim relies on a
		// module-scoped `require`, which ESM does not provide, so inject one via
		// createRequire. This makes both ESM (import.meta) and CJS (require) work.
			banner: {
				js: [
					'import { createRequire as __nexusCreateRequire } from "node:module";',
					"const require = __nexusCreateRequire(import.meta.url);",
				].join(""),
			},
			plugins: [aliasPlugin(ALIASES)],
			sourcemap: false,
			logLevel: "info",
		});

		console.log(`✅ Bundle created at ${OUTPUT}`);
	} catch (err) {
		console.error("❌ esbuild failed:", err.message);
		process.exit(1);
	}
}

main();
