import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, mkdir, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerCurrentNexusSession } from "../../../packages/extensions-pro/src/cmux/session-registry/registerCurrentNexusSession.js";
import { withCmuxSessionRegistryLock } from "../../../packages/extensions-pro/src/cmux/session-registry/withCmuxSessionRegistryLock.js";
import { withLockedCmuxEnv } from "../../support/cmux/withLockedCmuxEnv.js";

test("cmux session registration recovers from a stale registry lock directory", async () => {
	await withLockedCmuxEnv(async () => {
		const tempDir = await mkdtemp(join(tmpdir(), "nexus-cmux-lock-e2e-"));
		const registryPath = join(tempDir, "cmux-session-registry.json");
		const lockPath = `${registryPath}.lock`;
		const previousSurfaceId = process.env.CMUX_SURFACE_ID;
		const previousWorkspaceId = process.env.CMUX_WORKSPACE_ID;
		const previousRegistryPath = process.env.NEXUS_CMUX_SESSION_REGISTRY;

		try {
			await mkdir(lockPath, { recursive: true });
			const staleTime = new Date(Date.now() - 120_000);
			await utimes(lockPath, staleTime, staleTime);
			process.env.CMUX_SURFACE_ID = "surface-stale-lock";
			process.env.CMUX_WORKSPACE_ID = "workspace-stale-lock";
			process.env.NEXUS_CMUX_SESSION_REGISTRY = registryPath;

			await registerCurrentNexusSession("session-stale-lock", "/tmp/session.jsonl", "Recovered session");

			const registry = JSON.parse(readFileSync(registryPath, "utf8"));
			assert.equal(registry.entries.length, 1);
			assert.equal(registry.entries[0].surfaceId, "surface-stale-lock");
			assert.equal(registry.entries[0].sessionId, "session-stale-lock");
			assert.equal(existsSync(lockPath), false);
		} finally {
			if (previousSurfaceId === undefined) delete process.env.CMUX_SURFACE_ID;
			else process.env.CMUX_SURFACE_ID = previousSurfaceId;
			if (previousWorkspaceId === undefined) delete process.env.CMUX_WORKSPACE_ID;
			else process.env.CMUX_WORKSPACE_ID = previousWorkspaceId;
			if (previousRegistryPath === undefined) delete process.env.NEXUS_CMUX_SESSION_REGISTRY;
			else process.env.NEXUS_CMUX_SESSION_REGISTRY = previousRegistryPath;
			await rm(tempDir, { recursive: true, force: true });
		}
	});
});

test("cmux session registry lock serializes active writers", async () => {
	const tempDir = await mkdtemp(join(tmpdir(), "nexus-cmux-active-lock-e2e-"));
	const registryPath = join(tempDir, "cmux-session-registry.json");
	const events: string[] = [];

	try {
		const first = withCmuxSessionRegistryLock(registryPath, async () => {
			events.push("first-start");
			await new Promise((resolve) => setTimeout(resolve, 75));
			events.push("first-end");
		});
		await new Promise((resolve) => setTimeout(resolve, 10));
		const second = withCmuxSessionRegistryLock(registryPath, async () => {
			events.push("second");
		});

		await Promise.all([first, second]);

		assert.deepEqual(events, ["first-start", "first-end", "second"]);
		assert.equal(existsSync(`${registryPath}.lock`), false);
	} finally {
		await rm(tempDir, { recursive: true, force: true });
	}
});
