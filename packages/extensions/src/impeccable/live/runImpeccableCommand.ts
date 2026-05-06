import { exec } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

const execAsync = promisify(exec);

// Path to the impeccable skill - check both locations
function getImpeccableSkillPath(): string {
	const candidates = [
		join(process.cwd(), ".agents", "skills", "impeccable"),
		resolve(import.meta.dirname, "../../../../../../.agents/skills/impeccable"),
		join(homedir(), ".agents", "skills", "impeccable"),
	];

	const skillPath = candidates.find((candidate) => existsSync(join(candidate, "scripts")));
	if (skillPath) return skillPath;

	throw new Error("Impeccable skill not found. Install it at .agents/skills/impeccable or ~/.agents/skills/impeccable.");
}

/**
 * Sub-commands available under /impeccable
 */
export const SUBCOMMANDS = [
	{ name: "craft", description: "Shape then build a feature end-to-end" },
	{ name: "shape", description: "Plan UX/UI before writing code" },
	{ name: "teach", description: "Set up PRODUCT.md and DESIGN.md context" },
	{ name: "document", description: "Generate DESIGN.md from existing code" },
	{ name: "extract", description: "Pull reusable tokens into design system" },
	{ name: "critique", description: "UX design review with heuristic scoring" },
	{ name: "audit", description: "Technical quality checks (a11y, perf)" },
	{ name: "polish", description: "Final quality pass before shipping" },
	{ name: "bolder", description: "Amplify safe or bland designs" },
	{ name: "quieter", description: "Tone down aggressive designs" },
	{ name: "distill", description: "Strip to essence, remove complexity" },
	{ name: "harden", description: "Production-ready: errors, i18n, edge cases" },
	{ name: "onboard", description: "Design first-run flows and empty states" },
	{ name: "animate", description: "Add purposeful animations and motion" },
	{ name: "colorize", description: "Add strategic color to monochromatic UIs" },
	{ name: "typeset", description: "Improve typography hierarchy and fonts" },
	{ name: "layout", description: "Fix spacing, rhythm, and visual hierarchy" },
	{ name: "delight", description: "Add personality and memorable touches" },
	{ name: "overdrive", description: "Push past conventional limits" },
	{ name: "clarify", description: "Improve UX copy, labels, and error messages" },
	{ name: "adapt", description: "Adapt for different devices and screen sizes" },
	{ name: "optimize", description: "Diagnose and fix UI performance" },
	{ name: "live", description: "🔴 Live variant mode: select elements in browser, get AI variants", isHighlighted: true },
] as const;

/**
 * Execute a node script and return parsed JSON output.
 */
async function runScript(scriptName: string, args: string[] = []): Promise<Record<string, unknown> | null> {
	try {
		const scriptPath = join(getImpeccableSkillPath(), "scripts", scriptName);
		const cmd = `node "${scriptPath}" ${args.map(a => `"${a}"`).join(" ")}`;
		const { stdout } = await execAsync(cmd, { cwd: process.cwd(), timeout: 30000 });
		return JSON.parse(stdout.trim());
	} catch (error) {
		console.error(`[impeccable] Script error: ${scriptName}`, error);
		return null;
	}
}

/**
 * Run the impeccable live subcommand.
 * This starts the live server, injects the browser script, and prepares the poll loop.
 */
export async function runImpeccableLive(ctx: ExtensionCommandContext): Promise<{
	serverPort: number;
	serverToken: string;
	pageFiles: string[];
} | null> {
	const result = await runScript("live.mjs");
	if (result && result.ok) {
		ctx.ui.notify("Impeccable Live mode started. Open your dev server in the browser.", "info");
		return {
			serverPort: result.serverPort as number,
			serverToken: result.serverToken as string,
			pageFiles: result.pageFiles as string[],
		};
	}
	ctx.ui.notify(`Impeccable Live setup failed: ${result?.error || "Unknown error"}`, "error");
	return null;
}

/**
 * Run the impeccable poll loop (for live mode).
 */
export async function runImpeccablePoll(): Promise<Record<string, unknown> | null> {
	return runScript("live-poll.mjs");
}

/**
 * Run the impeccable live-status command.
 */
export async function runImpeccableStatus(): Promise<Record<string, unknown> | null> {
	return runScript("live-status.mjs");
}

/**
 * Check if a subcommand is valid.
 */
function isValidSubcommand(cmd: string): cmd is typeof SUBCOMMANDS[number]["name"] {
	return SUBCOMMANDS.some(c => c.name === cmd);
}

/**
 * Run an impeccable subcommand.
 * For /impeccable live, this starts the live mode server and notifies the user.
 * For other commands, it triggers the skill execution via Bash.
 */
export async function runImpeccableCommand(
	subcommand: string,
	args: string,
	ctx: ExtensionCommandContext,
): Promise<void> {
	// Validate the subcommand
	if (!isValidSubcommand(subcommand)) {
		const validCommands = SUBCOMMANDS.map(c => c.name).join(", ");
		ctx.ui.notify(`Unknown subcommand: ${subcommand}. Valid: ${validCommands}`, "error");
		return;
	}

	// Special handling for live mode
	if (subcommand === "live") {
		const liveResult = await runImpeccableLive(ctx);
		if (liveResult) {
			// Inform the user about what to do next
			const message = `**Impeccable Live Started**

Server running on port ${liveResult.serverPort}
Injected into: ${liveResult.pageFiles.join(", ")}

**Next steps:**
1. Open your dev server in the browser
2. The Impeccable overlay will appear
3. Select elements and pick a design action
4. The AI will generate variants you can preview and accept

*Run \`live-poll.mjs\` to enter the poll loop for continuous iteration.*`;

			ctx.ui.notify("Live mode ready! Open your dev server in browser.", "info");

			// TODO: The agent needs to continue with the poll loop
			// This is handled by the agent loop itself via the skill
		}
		return;
	}

	// For other commands, trigger via Bash (the skill system will pick this up)
	// The command will be executed as part of the agent's tool usage
	const cmd = `npx impeccable ${subcommand} ${args}`.trim();
	ctx.ui.notify(`Running /impeccable ${subcommand}...`, "info");

	// Execute and capture output
	try {
		const { stdout, stderr } = await execAsync(cmd, {
			cwd: ctx.cwd,
			timeout: 120000,
			env: { ...process.env, IMPECCABLE_CONTEXT_DIR: ctx.cwd },
		});

		if (stdout) {
			console.log(`[impeccable ${subcommand}]`, stdout);
		}
		if (stderr) {
			console.error(`[impeccable ${subcommand} stderr]`, stderr);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		ctx.ui.notify(`Impeccable ${subcommand} failed: ${errorMessage}`, "error");
		console.error(`[impeccable] Error running ${subcommand}:`, error);
	}
}