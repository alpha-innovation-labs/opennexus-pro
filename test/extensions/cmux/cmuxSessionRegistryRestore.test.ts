import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readCmuxSessionRegistry } from "../../../packages/extensions/src/cmux/session-registry/readCmuxSessionRegistry.js";
import { registerCurrentNexusSession } from "../../../packages/extensions/src/cmux/session-registry/registerCurrentNexusSession.js";

/**
 * Restores one environment variable after a test mutation.
 *
 * @param name Environment variable name.
 * @param value Previous environment variable value.
 */
function restoreEnv(name: string, value: string | undefined): void {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}

test("cmux session registry stores durable Nexus direct-resume metadata", async () => {
	const directory = await mkdtemp(join(tmpdir(), "nexus-cmux-registry-"));
	const registryPath = join(directory, "registry.json");
	const previousRegistry = process.env.NEXUS_CMUX_SESSION_REGISTRY;
	const previousWorkspace = process.env.CMUX_WORKSPACE_ID;
	const previousSurface = process.env.CMUX_SURFACE_ID;
	const previousPackageDir = process.env.PI_PACKAGE_DIR;
	process.env.NEXUS_CMUX_SESSION_REGISTRY = registryPath;
	process.env.CMUX_WORKSPACE_ID = "019dfa81-5a20-77f0-a4cf-c70de99d3416";
	process.env.CMUX_SURFACE_ID = "019dfa81-5a20-77f0-a4cf-c70de99d3417";
	const packageDir = join(directory, "opennexus");
	await mkdir(join(packageDir, "bin"), { recursive: true });
	await writeFile(join(packageDir, "bin", "nexus"), "#!/usr/bin/env bash\n");
	process.env.PI_PACKAGE_DIR = packageDir;
	try {
		await registerCurrentNexusSession("019dfa81-5a20-77f0-a4cf-c70de99d3418", "/tmp/session.jsonl", "Build agent");

		const registry = await readCmuxSessionRegistry(registryPath);
		const entry = registry.entries[0];
		assert.equal(entry?.workspaceId, process.env.CMUX_WORKSPACE_ID);
		assert.equal(entry?.surfaceId, process.env.CMUX_SURFACE_ID);
		assert.equal(entry?.sessionId, "019dfa81-5a20-77f0-a4cf-c70de99d3418");
		assert.equal(entry?.sessionFile, "/tmp/session.jsonl");
		assert.equal(entry?.cwd, process.cwd());
		assert.equal(entry?.restoreCommand?.command, join(packageDir, "bin", "nexus"));
		assert.deepEqual(entry?.restoreCommand?.args.slice(-2), ["--resume", "019dfa81-5a20-77f0-a4cf-c70de99d3418"]);
		assert.match(entry?.restoreCommand?.input ?? "", /--resume/);
	} finally {
		restoreEnv("NEXUS_CMUX_SESSION_REGISTRY", previousRegistry);
		restoreEnv("CMUX_WORKSPACE_ID", previousWorkspace);
		restoreEnv("CMUX_SURFACE_ID", previousSurface);
		restoreEnv("PI_PACKAGE_DIR", previousPackageDir);
		await rm(directory, { recursive: true, force: true });
	}
});
