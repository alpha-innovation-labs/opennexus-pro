import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const AGENT_TUI = "agent-tui";

/**
 * Returns trimmed stdout from an agent-tui CLI subcommand.
 */
function agentTui(...args: string[]): string {
	return execFileSync(AGENT_TUI, args, { encoding: "utf8" }).trim();
}

/**
 * Options for preparing a Nexus test environment.
 */
export interface PrepareNexusTestOptions {
	/** Unique session name (e.g. "chrome-disabled-check"). */
	sessionName: string;
	/** Optional base directory for dump files (defaults to tmpdir). */
	dumpDir?: string;
}

/**
 * Result of preparing a Nexus test environment.
 */
export interface PreparedNexusTest {
	/** The session name used. */
	sessionName: string;
	/** The dump directory path. */
	dumpDir: string;
}

/**
 * Prepares Nexus for e2e testing by creating an agent-tui session, launching
 * Nexus (dev or prod), and opening the /pi-packages modal.
 *
 * Reads `process.env.NEXUS_TEST_ENV`:
 * - `"dev"` (default) — runs `just dev` inside the session.
 * - `"prod"` — runs the installed `nexus` binary.
 *
 * @param options Session name and optional dump directory.
 * @returns A handle containing the session name and dump directory.
 */
export async function prepareNexusTest(
	options: PrepareNexusTestOptions,
): Promise<PreparedNexusTest> {
	const { sessionName, dumpDir: customDumpDir } = options;
	const dumpDir = customDumpDir ?? join(tmpdir(), `nexus-${sessionName}-dump`);
	const env = process.env.NEXUS_TEST_ENV ?? "dev";

	// Step 1: Clean up previous session and dump dir
	try {
		agentTui("session", "delete", sessionName);
	} catch {
		/* ignore */
	}
	try {
		await rm(dumpDir, { recursive: true, force: true });
	} catch {
		/* ignore */
	}

	// Step 2: Create a fresh agent-tui session
	agentTui("session", "create", sessionName);

	// Step 3: Launch Nexus — dev uses `just dev`, prod uses `nexus`
	const launchCommand = env === "prod" ? "nexus" : "just dev";
	agentTui("exec", sessionName, launchCommand);

	// Step 4: Press Enter to start Nexus
	agentTui("send-keys", sessionName, "Enter");

	// Step 5: Wait for Nexus to boot
	// Caller awaits externally; this helper returns immediately after setup.

	// Step 6: Open /pi-packages modal
	agentTui("exec", sessionName, "/pi-packages");
	agentTui("send-keys", sessionName, "Enter");

	return { sessionName, dumpDir };
}
