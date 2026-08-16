import { existsSync, readdirSync, statSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { parseFactoryArgs, type FactoryArgs } from "./parseFactoryArgs.js";
import {
	createWorkflow,
	addStep,
	addControlBlock,
	editStep,
	removeStep,
	editControlBlock,
	removeControlBlock,
	addStepToControl,
	removeStepFromControl,
	findNodes,
	walkWorkflow,
	validateWorkflow,
	saveWorkflow,
	loadWorkflow,
	deleteWorkflow,
	hasErrors,
	formatErrors,
} from "../index.js";

/**
 * Runs the factory CLI command.
 *
 * Usage:
 *   nexus factory list              — List available factories
 *   nexus factory explain           — Explain how to create a factory
 *   nexus factory paths             — Show factory file paths
 *   nexus factory read <name>       — Display a factory's YAML content
 *   nexus factory validate <name>   — Validate a factory, show errors
 *
 * On startup, ensures the local `.factory/` directory exists.
 *
 * @param argv Raw CLI arguments.
 * @returns Process exit code.
 */
export async function runFactoryCommand(
	argv: readonly string[],
): Promise<number> {
	const parsed = parseFactoryArgs(argv);

	switch (parsed.command) {
		case "list": {
			return runFactoryList();
		}

		case "explain": {
			return runFactoryExplain();
		}

		case "paths": {
			return runFactoryPaths();
		}

		case "read": {
			if ("name" in parsed) {
				return runFactoryRead(parsed.name);
			}
			return 0;
		}

		case "validate": {
			if ("name" in parsed) {
				return runFactoryValidate(parsed.name);
			}
		}

		case "help": {
			const invalid =
				"invalidSubcommand" in parsed
					? parsed.invalidSubcommand
					: null;
			if (invalid) {
				console.error(`Unknown subcommand "${invalid}" for "factory".`);
			}
			console.log(`
factory — Manage workflow factories.

Usage:
  nexus factory list              List available factories
  nexus factory explain           Explain how to create a factory
  nexus factory paths             Show factory file paths
  nexus factory read <name>       Display a factory's YAML content
  nexus factory validate <name>   Validate a factory, show errors

On startup, factory ensures the local .factory/ directory exists.
`);
			return 0;
		}

		default: {
			return 0;
		}
	}
}

// ─── Subcommand handlers ────────────────────────────────────────────────────

async function runFactoryList(): Promise<number> {
	const cwd = process.cwd();
	const factoryDir = join(cwd, ".factory");

	if (!existsSync(factoryDir)) {
		mkdirSync(factoryDir, { recursive: true });
	}

	const factoryFiles: Array<{ name: string; path: string; source: string }> = [];

	if (existsSync(factoryDir) && statSync(factoryDir).isDirectory()) {
		const items = readdirSync(factoryDir);
		for (const item of items) {
			const fullPath = join(factoryDir, item);
			if (statSync(fullPath).isFile()) {
				factoryFiles.push({ name: item, path: fullPath, source: ".factory" });
			}
		}
	}

	const examplesDir = join(cwd, "examples");
	if (existsSync(examplesDir) && statSync(examplesDir).isDirectory()) {
		const items = readdirSync(examplesDir);
		for (const item of items) {
			const fullPath = join(examplesDir, item);
			if (statSync(fullPath).isFile()) {
				factoryFiles.push({ name: item, path: fullPath, source: "examples" });
			}
		}
	}

	if (factoryFiles.length === 0) {
		console.log("No factories found.\n");
		console.log("Create one with:");
		console.log("  nexus factory explain");
		return 0;
	}

	console.log("Available factories:\n");
	for (const f of factoryFiles) {
		const label = f.source === ".factory" ? f.name : `[template] ${f.name}`;
		console.log(`  ${label}`);
	}

	return 0;
}

function runFactoryExplain(): number {
	console.log(`
factory explain — How to create a factory

A factory defines a workflow — a sequence of automated and AI-driven steps,
orchestrated through control blocks that govern execution order, iteration,
and validation.

Workflow files are YAML files placed in either:

  .factory/<name>.yaml   — project-local factory (per-project)
  examples/<name>.yaml   — shared template (from repo)

Workflow structure:

  name: <identifier>

  # Optional control blocks (executed in order)
  control:
    - type: loop_until | parallel
      max_iterations: <number>
      steps:
        - id: <step-id>
          type: bash | agent
          command: "<shell command or agent prompt>"
          validation_prompt: "<what passes the step>"  # bash only

  # Final steps (always sequential, after all control blocks)
  steps:
    - id: <step-id>
      type: bash | agent
      command: "<shell command or agent prompt>"

Step types:

  bash  — Runs a command, captures output. If validation fails, the loop
          retries (loop_until) or the next step sees the failure.
  agent — Spawns a persistent AI agent (Nexus) to inspect, reason, and
          fix issues from <previous-output>.

Output passing:

  Steps reference the immediately preceding step's output via
  <previous-output> templates, resolved by step id. No global state —
  each step only sees its predecessor.

Control block types:

  loop_until  — Sequential, retry until validation passes.
  parallel    — Concurrent execution, fail fast.

Example (dev.yaml):

  name: dev
  control:
    - id: dev
      type: bash
      command: "just dev"
      validation_prompt: "dev should display a help menu"
    - id: fix
      type: agent
      command: 'nexus "just dev failed because: <previous-output>"'
  steps:
    - id: fmt
      type: bash
      command: "just fmt"
  steps:
    - id: notify
      type: bash
      command: "notify 'dev workflow complete'"

To create your own factory:

  1. Create .factory/ in your project root (done automatically).
  2. Create a YAML file: .factory/my-workflow.yaml
  3. Define name, control blocks, and steps.
  4. List available factories: nexus factory list
`);
	return 0;
}

function runFactoryPaths(): number {
	const cwd = process.cwd();
	console.log("Factory paths:");
	console.log(`  Local:  ${join(cwd, ".factory")}`);
	console.log(`  Templates: ${join(cwd, "examples")}`);
	return 0;
}

function runFactoryRead(name: string): number {
	if (!name) {
		console.error("Usage: nexus factory read <name>");
		return 1;
	}

	const cwd = process.cwd();
	const factoryFile = join(cwd, ".factory", `${name}.yaml`);
	const exampleFile = join(cwd, "examples", `${name}.yaml`);

	let content: string | null = null;
	let source = "";

	if (existsSync(factoryFile)) {
		content = readFileSync(factoryFile, "utf-8");
		source = ".factory";
	} else if (existsSync(exampleFile)) {
		content = readFileSync(exampleFile, "utf-8");
		source = "examples";
	} else {
		console.error(`Factory "${name}" not found.`);
		console.error(`  Searched: .factory/${name}.yaml, examples/${name}.yaml`);
		return 1;
	}

	console.log(`--- ${source}/${name}.yaml ---`);
	console.log(content);
	return 0;
}

function runFactoryValidate(name: string): number {
	if (!name) {
		console.error("Usage: nexus factory validate <name>");
		return 1;
	}

	const cwd = process.cwd();
	const factoryFile = join(cwd, ".factory", `${name}.yaml`);
	const exampleFile = join(cwd, "examples", `${name}.yaml`);

	let filePath: string | null = null;

	if (existsSync(factoryFile)) {
		filePath = factoryFile;
	} else if (existsSync(exampleFile)) {
		filePath = exampleFile;
	} else {
		console.error(`Factory "${name}" not found.`);
		return 1;
	}

	const workflow = loadWorkflow(filePath);
	if (workflow === null) {
		console.error(`Failed to load workflow "${name}".`);
		return 1;
	}
	const errors = validateWorkflow(workflow);

	if (hasErrors(errors)) {
		console.error(`Validation errors for "${name}":`);
		console.error(formatErrors(errors));
		return 1;
	}

	console.log(`✓ "${name}" is valid.`);
	return 0;
}
