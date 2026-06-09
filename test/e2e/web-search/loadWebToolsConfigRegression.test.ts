import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadWebToolsConfig } from "../../../packages/extension-core/src/web-search/config/loadWebToolsConfig.js";

/**
 * Regression test for the web-tools config crash when ~/.config/nexus/config.json
 * exists but lacks the searxng/crawl4ai/jina sections (it is a general Nexus app config).
 */

test("loadWebToolsConfig handles a general Nexus config file without web-tools sections", () => {
	const tmpDir = mkdtempSync(join(tmpdir(), "nexus-webtools-test-"));
	const originalConfigDir = process.env.NEXUS_CONFIG_DIR;
	process.env.NEXUS_CONFIG_DIR = tmpDir;
	const warnings: string[] = [];
	const originalWarn = console.warn;
	console.warn = (...args: unknown[]) => {
		warnings.push(args.join(" "));
	};

	try {
		writeFileSync(
			join(tmpDir, "config.json"),
			JSON.stringify({
				data: { root: "~/.local/share/nexus" },
				workspace: { preferences: { themeMode: "dark" } },
				miniApps: { tetris: { musicEnabled: false } },
			}),
		);

		const config = loadWebToolsConfig();

		assert.strictEqual(typeof config.searxng.url, "string");
		assert.strictEqual(typeof config.crawl4ai.url, "string");
		assert.strictEqual(typeof config.jina.apiKey, "string");

		assert.ok(warnings.some((w) => w.includes('missing the "searxng" section')), "Expected warning for missing searxng");
		assert.ok(warnings.some((w) => w.includes('missing the "crawl4ai" section')), "Expected warning for missing crawl4ai");
		// Jina is optional (free tier works without config) — no warning expected.
		assert.ok(!warnings.some((w) => w.includes('missing the "jina" section')), "Did not expect warning for optional jina");
	} finally {
		process.env.NEXUS_CONFIG_DIR = originalConfigDir;
		console.warn = originalWarn;
	}
});

test("loadWebToolsConfig handles a partially-populated config file", () => {
	const tmpDir = mkdtempSync(join(tmpdir(), "nexus-webtools-test-"));
	const originalConfigDir = process.env.NEXUS_CONFIG_DIR;
	process.env.NEXUS_CONFIG_DIR = tmpDir;
	const warnings: string[] = [];
	const originalWarn = console.warn;
	console.warn = (...args: unknown[]) => {
		warnings.push(args.join(" "));
	};

	try {
		writeFileSync(
			join(tmpDir, "config.json"),
			JSON.stringify({
				searxng: { url: "http://custom.example.com:8080" },
			}),
		);

		const config = loadWebToolsConfig();

		assert.strictEqual(config.searxng.url, "http://custom.example.com:8080");
		assert.strictEqual(config.searxng.enabled, true);
		assert.strictEqual(config.crawl4ai.url, "http://100.106.251.92:11235");
		assert.strictEqual(config.jina.apiKey, "");

		assert.ok(!warnings.some((w) => w.includes('missing the "searxng" section')), "Did not expect warning for present searxng");
		assert.ok(warnings.some((w) => w.includes('missing the "crawl4ai" section')), "Expected warning for missing crawl4ai");
		// Jina is optional (free tier works without config) — no warning expected.
		assert.ok(!warnings.some((w) => w.includes('missing the "jina" section')), "Did not expect warning for optional jina");
	} finally {
		process.env.NEXUS_CONFIG_DIR = originalConfigDir;
		console.warn = originalWarn;
	}
});
