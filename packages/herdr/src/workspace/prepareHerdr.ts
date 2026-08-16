/**
 * Creates a new Herdr workspace, waits 0.5s for the root pane, starts a
 * default agent with kind "mastracode", and returns workspace + pane +
 * agent identifiers. Mirrors the behavior of herdr-start-agent.sh.
 *
 * @param options Workspace label and optional max wait time.
 * @returns Handle containing workspaceId, rootPaneId, and agentName.
 */

import { execSync } from "node:child_process";
import { runHerdr } from "../core/runHerdr.js";
import { drill } from "../core/drill.js";

export interface PrepareHerdrOptions {
	/** Unique label for the workspace (default: "nexus-e2e"). */
	workspaceLabel?: string;
	/** Maximum seconds to wait for the pane to become available (default 30). */
	maxWaitSeconds?: number;
	/** Agent name to use instead of generating a random one. */
	agentName?: string;
}

export interface PreparedHerdr {
	/** The workspace ID (e.g. "w42"). */
	workspaceId: string;
	/** The root pane ID (e.g. "w42:p1"). */
	rootPaneId: string;
	/** The agent name that was started (e.g. "agent-3a1f"). */
	agentName: string;
}

export function prepareHerdr(options: PrepareHerdrOptions = {}): PreparedHerdr {
	const { workspaceLabel = "nexus-e2e", agentName: providedAgentName } =
		options;

	// Step 1: Create workspace (no-focus to avoid stealing UI focus).
	const createData = runHerdr([
		"workspace",
		"create",
		"--label",
		workspaceLabel,
		"--no-focus",
	]);
	const workspaceId = drill(createData, "result", "workspace", "workspace_id");
	const rootPaneId = drill(createData, "result", "root_pane", "pane_id");

	if (!workspaceId || !rootPaneId) {
		throw new Error(
			`Failed to create workspace: ${JSON.stringify(createData)}`,
		);
	}

	console.error(
		`  Workspace created: ${workspaceId} (label: ${workspaceLabel})`,
	);
	console.error(`  Root pane: ${rootPaneId}`);

	// Step 2: Wait 0.5s for the root pane to become available (matches herdr-start-agent.sh).
	console.error(
		`  → Waiting 0.5s for root pane ${rootPaneId} to become available ...`,
	);
	execSync("sleep 0.5", { stdio: "ignore" });
	console.error(`  ✓ Root pane ${rootPaneId} is ready`);

	// Step 3: Generate or use provided agent name, then start the agent (matches herdr-start-agent.sh).
	const randomHex = Buffer.from(crypto.getRandomValues(new Uint8Array(4)))
		.toString("hex")
		.slice(0, 4);
	const agentName = providedAgentName ?? `agent-${randomHex}`;

	console.error(
		`  → Starting agent '${agentName}' (kind: mastracode) in pane ${rootPaneId} ...`,
	);
	const startResult = runHerdr([
		"agent",
		"start",
		agentName,
		"--kind",
		"mastracode",
		"--pane",
		rootPaneId,
	]);

	const error = (startResult.error as Record<string, string>)?.code;
	if (error) {
		// Agent start failure is a catastrophic error — the agent never started.
		const message =
			(startResult.error as Record<string, string>)?.message ?? error;
		throw new Error(`FATAL: Agent start failed — ${message}`);
	} else {
		const name = drill(startResult, "result", "agent", "name") ?? agentName;
		console.error(`  ✓ Agent started: ${name}`);
	}

	return { workspaceId, rootPaneId, agentName };
}
