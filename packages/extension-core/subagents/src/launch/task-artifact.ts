import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Write the task text to an artifact file and return its absolute path.
 *
 * The task is passed to the child by artifact-file reference (a `@<path>` in the
 * argv) rather than inlined, so a long prompt never hits argument-length limits or
 * shell-quoting edge cases. pi reads the file to build the child's initial prompt;
 * the argv carries only the reference.
 *
 * @param dir Directory to create the file in. Created if missing.
 * @param task The task text to persist.
 * @param name A stable name fragment for the file. Defaults to a short random id.
 * @returns The absolute path and the file name.
 */
export function writeTaskArtifact(options: {
	readonly dir: string;
	readonly task: string;
	readonly name?: string;
}): { readonly path: string; readonly fileName: string } {
	const dir = resolve(options.dir);
	mkdirSync(dir, { recursive: true });
	const stem = options.name ?? randomUUID().slice(0, 8);
	const fileName = `task-${stem}.md`;
	const path = join(dir, fileName);
	writeFileSync(path, options.task, "utf8");
	return { path, fileName };
}
