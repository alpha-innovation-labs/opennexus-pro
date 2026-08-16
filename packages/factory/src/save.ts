import fs from "node:fs";
import path from "node:path";

import { parse, stringify } from "yaml";

import { type Workflow, WorkflowFileSchema } from "./schema.js";

const STORAGE_DIR = ".factory";

/**
 * Returns the directory where workflow files are stored.
 */
export function getFactoryDir(): string {
	return path.resolve(STORAGE_DIR);
}

/**
 * Returns the full path for a workflow file.
 */
export function getWorkflowPath(name: string): string {
	return path.resolve(getFactoryDir(), `${name}.yaml`);
}

/**
 * Saves a workflow to the `.factory/` directory as a YAML file.
 */
export function saveWorkflow(workflow: Workflow): void {
	const workflowDir = path.resolve(STORAGE_DIR);
	if (!fs.existsSync(workflowDir)) {
		fs.mkdirSync(workflowDir, { recursive: true });
	}

	const filePath = path.resolve(workflowDir, `${workflow.name}.yaml`);
	const yamlContent = WorkflowFileSchema.parse(workflow);
	const yaml = stringify(yamlContent);
	fs.writeFileSync(filePath, yaml, "utf-8");
}

/**
 * Loads a workflow from the `.factory/` directory.
 */
export function loadWorkflow(name: string): Workflow | null {
	const filePath = path.resolve(getFactoryDir(), `${name}.yaml`);
	if (!fs.existsSync(filePath)) {
		return null;
	}

	const yaml = fs.readFileSync(filePath, "utf-8");
	const parsed = parse(yaml);
	const result = WorkflowFileSchema.safeParse(parsed);
	if (!result.success) {
		throw new Error(`Invalid workflow file "${name}.yaml": ${result.error.message}`);
	}
	return result.data;
}

/**
 * Deletes a workflow file from the `.factory/` directory.
 */
export function deleteWorkflow(name: string): void {
	const filePath = path.resolve(getFactoryDir(), `${name}.yaml`);
	if (!fs.existsSync(filePath)) {
		throw new Error(`Workflow "${name}" not found.`);
	}
	fs.unlinkSync(filePath);
}
