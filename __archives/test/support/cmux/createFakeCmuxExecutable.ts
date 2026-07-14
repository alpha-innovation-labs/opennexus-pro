import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type FakeCmuxExecutable = {
	directoryPath: string;
	executablePath: string;
	logPath: string;
};

/**
 * Creates a temporary fake cmux executable for deterministic tests.
 *
 * @returns Paths for the fake executable and its captured log file.
 */
export async function createFakeCmuxExecutable(): Promise<FakeCmuxExecutable> {
	const directoryPath = await mkdtemp(join(tmpdir(), "nexus-cmux-"));
	const executablePath = join(directoryPath, "cmux");
	const logPath = join(directoryPath, "cmux.log");
	await writeFile(
		executablePath,
		[
			"#!/bin/sh",
			"if [ -n \"$CMUX_TEST_LOG\" ]; then",
			"  printf '%s\\n' \"$@\" >> \"$CMUX_TEST_LOG\"",
			"fi",
			"exit 0",
		].join("\n"),
		"utf8",
	);
	await chmod(executablePath, 0o755);
	return { directoryPath, executablePath, logPath };
}
