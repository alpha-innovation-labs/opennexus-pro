import { existsSync, readdirSync, statSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { z } from "zod";
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
import { WorkflowFileSchema, type WorkflowFile } from "../schema.js";

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

		case "validate-file": {
			if ("path" in parsed) {
				return runFactoryValidateFile(parsed.path);
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
  nexus factory validate-file <path>  Validate a TypeScript workflow file

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

// ─── validate-file subcommand ────────────────────────────────────────────────

/**
 * Loads a TypeScript workflow file (e.g. check-automate.ts) and validates
 * the exported object against the Zod schema from examples/workflow-schema.ts,
 * reporting any structural errors in each step.
 *
 * @param name Workflow name (file name without extension).
 * @returns Process exit code.
 */
async function runFactoryValidateFile(filePath: string): Promise<number> {
	if (!filePath) {
		console.error("Usage: nexus factory validate-file <path>");
		return 1;
	}

	const cwd = process.cwd();
	const tsPath = join(cwd, filePath);

	if (!existsSync(tsPath)) {
		console.error(`Workflow file not found: ${filePath}`);
		return 1;
	}

	// Dynamically import the module so we can get the exported object.
	let mod: Record<string, unknown>;

	try {
		mod = await import(/* @vite-ignore */ `file://${tsPath}`);
	} catch (err) {
		console.error(`Failed to import "${filePath}":`);
		if (err instanceof Error) {
			console.error(err.message);
		}
		return 1;
	}

	// Find the exported WorkflowFile object.
	const workflowObj = findWorkflowExport(mod);
	if (!workflowObj) {
		console.error(
			`No WorkflowFile export found in "${filePath}". Expected a named export like "export const <name>: WorkflowFile".`,
		);
		return 1;
	}

	// Validate against the rich schema (mirrors examples/workflow-schema.ts).
	// We build Zod schemas top-down, avoiding the circular reference between
	// ControlBlock and StepOrControl by defining the step/control union as a
	// flat discriminated union on the known control block types.

	// Input schema
	const richInputSchema = z.object({
		name: z.string(),
		type: z.enum(["string", "number", "boolean"]).default("string"),
		description: z.string().optional(),
		default: z.string().optional(),
	});

	// Step schemas
	const richBashStep = z.object({
		id: z.string(),
		type: z.literal("bash"),
		command: z.string(),
		output: z.string().optional(),
		validation_prompt: z.string().optional(),
		inputs: z.array(richInputSchema).optional(),
	});

	const richAgentStep = z.object({
		id: z.string(),
		type: z.literal("agent"),
		agent: z.string(),
		command: z.string(),
		output: z.string().optional(),
		inputs: z.array(richInputSchema).optional(),
	});

	const richStepSchema = z.discriminatedUnion("type", [richBashStep, richAgentStep]);

	// Control block schemas — no circular references. Each is self-contained.
	// Steps inside control blocks use z.any() since they can be steps or nested
	// control blocks. The recursive structure is validated by Zod at runtime.
	const richLoopUntil = z.object({
		id: z.string(),
		type: z.literal("loop_until"),
		max_iterations: z.number().int().min(1).default(3),
		inputs: z.array(richInputSchema).optional(),
		steps: z.array(z.any()).min(1),
	});

	const richParallel = z.object({
		id: z.string(),
		type: z.literal("parallel"),
		max_iterations: z.number().int().min(1).default(3),
		inputs: z.array(richInputSchema).optional(),
		steps: z.array(z.any()).min(1),
	});

	const richForeach = z.object({
		id: z.string(),
		type: z.literal("foreach"),
		max_iterations: z.number().int().min(1).default(3),
		inputs: z.array(richInputSchema).optional(),
		steps: z.array(z.any()).min(1),
		items: z.string(),
		input_var: z.string().default("item"),
	});

	const richIfElse = z.object({
		id: z.string(),
		type: z.literal("if_else"),
		condition: z.string(),
		steps: z.array(z.any()).min(1),
		else_steps: z.array(z.any()).min(1).optional(),
	});

	const richDoUntil = z.object({
		id: z.string(),
		type: z.literal("do_until"),
		max_iterations: z.number().int().min(1).default(3),
		inputs: z.array(richInputSchema).optional(),
		steps: z.array(z.any()).min(1),
		condition: z.string(),
	});

	const richDoWhile = z.object({
		id: z.string(),
		type: z.literal("do_while"),
		max_iterations: z.number().int().min(1).default(3),
		inputs: z.array(richInputSchema).optional(),
		steps: z.array(z.any()).min(1),
		condition: z.string(),
	});

	const richControlSchema = z.discriminatedUnion("type", [
		richLoopUntil,
		richParallel,
		richForeach,
		richIfElse,
		richDoUntil,
		richDoWhile,
	]);

	const richFileSchema = z.object({
		prompt: z.string(),
		name: z.string().min(1),
		inputs: z.array(richInputSchema).optional(),
		control: z.array(richControlSchema).optional(),
		steps: z.array(richStepSchema).min(1),
	});

	// Validate against the schema.
	const result = richFileSchema.safeParse(workflowObj);

	if (!result.success) {
		const errors: Array<{ path: string; message: string; code: string }> =
			result.error.issues.map((issue) => ({
				path: String(issue.path.join(".")) || "root",
				message: issue.message ?? "",
				code: issue.code ?? "PARSE_ERROR",
			}));

		// Also check for duplicate step IDs (cross-step validation).
		const dupErrors = checkDuplicateIdsWorkflow(workflowObj);
		errors.push(...dupErrors);

		if (hasErrors(errors)) {
			console.error(`Validation errors for "${name}":`);
			console.error(formatErrors(errors));
			return 1;
		}
	}

	console.log(`✓ "${name}" is valid.`);
	return 0;
}

/**
 * Finds the WorkflowFile export in a dynamically imported module.
 */
function findWorkflowExport(mod: Record<string, unknown>): Record<string, unknown> | null {
	for (const key of Object.keys(mod)) {
		if (
			key === "default" ||
			key === "__esModule" ||
			key === "__proto__" ||
			key === "__vite_ssr_exports__"
		) {
			continue;
		}
		const val = (mod as Record<string, unknown>)[key];
		if (
			val !== null &&
			typeof val === "object" &&
			"name" in val &&
			typeof (val as Record<string, unknown>).name === "string"
		) {
			return val;
		}
	}
	return null;
}

/**
 * Checks for duplicate step IDs across all steps and control blocks.
 */
function checkDuplicateIdsWorkflow(workflow: Record<string, unknown>): Array<{
	path: string;
	message: string;
	code: string;
}> {
	const errors: Array<{ path: string; message: string; code: string }> = [];
	const seen = new Map<string, string>();

	function checkStep(step: { id: string }, path: string): void {
		if (seen.has(step.id)) {
			const first = seen.get(step.id)!;
			errors.push({
				path: `${path}.id`,
				message: `Duplicate id "${step.id}" (first seen at ${first}).`,
				code: "DUPLICATE_STEP_ID",
			});
		} else {
			seen.set(step.id, path);
		}
	}

	function checkSteps(steps: Array<Record<string, unknown>>, parentPath: string): void {
		for (let i = 0; i < steps.length; i++) {
			const step = steps[i];
			const stepPath = `${parentPath}[${i}]`;

			if (step && typeof step === "object" && "type" in step && "steps" in step) {
				if ("id" in step && typeof step.id === "string") {
					checkStep(step.id as unknown as { id: string }, stepPath);
				}
				checkSteps(step.steps as Array<Record<string, unknown>>, stepPath);
			} else if (step && typeof step === "object" && "id" in step) {
				checkStep(step.id as unknown as { id: string }, stepPath);
			}
		}
	}

	if (workflow.steps && Array.isArray(workflow.steps)) {
		for (let i = 0; i < workflow.steps.length; i++) {
			checkStep(workflow.steps[i] as { id: string }, `steps[${i}]`);
		}
	}

	if (workflow.control && Array.isArray(workflow.control)) {
		for (let i = 0; i < workflow.control.length; i++) {
			const cb = workflow.control[i] as Record<string, unknown>;
			const cbPath = `control[${i}]`;

			if ("id" in cb && typeof cb.id === "string") {
				if (seen.has(cb.id)) {
					const first = seen.get(cb.id)!;
					errors.push({
						path: `${cbPath}.id`,
						message: `Duplicate id "${cb.id}" (first seen at ${first}).`,
						code: "DUPLICATE_ID",
					});
				} else {
					seen.set(cb.id as string, cbPath);
				}
			}

			if ("steps" in cb && Array.isArray(cb.steps)) {
				checkSteps(cb.steps, cbPath);
			}
		}
	}

	return errors;
}
