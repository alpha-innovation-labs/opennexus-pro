import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createRequire } from "node:module";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

const requireRuntimeModule = createRequire(import.meta.url);

/** Runs a source Nexus social automation command in an isolated home. */
async function runSocialAutomationCli(homeDir: string, args: readonly string[]) {
	return runCommand(buildSourceCliCommand(args), { cwd: process.cwd(), env: createReleaseTestEnv(homeDir), timeoutMs: 25_000 });
}

/** Starts a fixture HTTP server. */
async function startFixtureServer(handler: (path: string) => string): Promise<{ baseUrl: string; server: Server }> {
	const server = createServer((request, response) => {
		response.writeHead(200, { "content-type": "application/xml" });
		response.end(handler(new URL(request.url ?? "/", "http://fixture.local").pathname));
	});
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const address = server.address() as AddressInfo;
	return { baseUrl: `http://127.0.0.1:${address.port}`, server };
}

/** Reads a table row count from SQLite. */
function readCount(dbPath: string, table: string): number {
	const sqliteModule = requireRuntimeModule(process.versions.bun ? "bun:sqlite" : "node:sqlite") as { DatabaseSync?: new (path: string) => { prepare: (sql: string) => { get: () => unknown }; close: () => void } };
	const db = new sqliteModule.DatabaseSync!(dbPath);
	try {
		return Number((db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count?: number }).count ?? 0);
	} finally {
		db.close();
	}
}

test("source nexus social-automation help and status work", async () => {
	const homeDir = await createReleaseTestHome();
	try {
		const help = await runSocialAutomationCli(homeDir, ["social-automation", "--help"]);
		assert.equal(help.code, 0);
		assert.match(help.output, /nexus social-automation twitter fetch/u);
		const status = await runSocialAutomationCli(homeDir, ["social-automation", "status", "--json"]);
		assert.equal(status.code, 0);
		assert.match(status.output, /"twitterPosts": 0/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus social-automation twitter fetch dedupes Nitter RSS rows", async () => {
	const homeDir = await createReleaseTestHome();
	const dbPath = join(homeDir, "social.sqlite");
	const fixture = await startFixtureServer(() => `<?xml version="1.0"?><rss version="2.0"><channel><item><title>hello world</title><dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">@badlogicgames</dc:creator><pubDate>Mon, 11 May 2026 10:04:28 GMT</pubDate><guid>2053778258391355394</guid><link>https://nitter.net/badlogicgames/status/2053778258391355394#m</link><description>desc</description></item></channel></rss>`);
	try {
		const args = ["social-automation", "twitter", "fetch", "--account", "badlogicgames", "--nitter-base", fixture.baseUrl, "--db", dbPath, "--json"];
		assert.equal((await runSocialAutomationCli(homeDir, args)).code, 0);
		assert.equal((await runSocialAutomationCli(homeDir, args)).code, 0);
		assert.equal(readCount(dbPath, "twitter_posts"), 1);
	} finally {
		fixture.server.close();
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus social-automation youtube fetch dedupes rows and stores audio path", async () => {
	const homeDir = await createReleaseTestHome();
	const dbPath = join(homeDir, "social.sqlite");
	const fixture = await startFixtureServer(() => `<?xml version="1.0"?><feed><entry><yt:videoId xmlns:yt="http://www.youtube.com/xml/schemas/2015">abc123def45</yt:videoId><yt:channelId xmlns:yt="http://www.youtube.com/xml/schemas/2015">UC1234567890123456789012</yt:channelId><title>Video title</title><published>2026-05-11T14:00:52+00:00</published><author><name>Channel</name><uri>https://www.youtube.com/channel/UC1234567890123456789012</uri></author><link href="https://www.youtube.com/watch?v=abc123def45" /></entry></feed>`);
	try {
		await mkdir(join(homeDir, ".local", "bin"), { recursive: true });
		const stubPath = join(homeDir, ".local", "bin", "yt-dlp");
		await writeFile(stubPath, `#!/usr/bin/env node\nimport { writeFileSync, mkdirSync } from 'node:fs';\nimport { dirname } from 'node:path';\nconst out = process.argv[process.argv.indexOf('--output') + 1].replace('%(ext)s', 'mp3');\nmkdirSync(dirname(out), { recursive: true });\nwriteFileSync(out, 'audio');\n`, "utf8");
		await chmod(stubPath, 0o755);
		const args = ["social-automation", "youtube", "fetch", "--channel", "UC1234567890123456789012", "--youtube-feed-base", fixture.baseUrl, "--db", dbPath, "--audio-dir", join(homeDir, "audio"), "--json"];
		assert.equal((await runSocialAutomationCli(homeDir, args)).code, 0);
		assert.equal((await runSocialAutomationCli(homeDir, args)).code, 0);
		assert.equal(readCount(dbPath, "youtube_uploads"), 1);
	} finally {
		fixture.server.close();
		await removeReleaseTestHome(homeDir);
	}
});
