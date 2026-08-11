import { spawn } from "node:child_process";

/**
 * Runs a command and resolves with captured stdout when it exits successfully.
 *
 * @param {string} command Command binary.
 * @param {string[]} args Command arguments.
 * @param {object} [options] Spawn options.
 * @returns {Promise<string>} Captured stdout.
 */
export function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			...options,
			stdio: ["ignore", "pipe", "inherit"],
		});
		const chunks = [];
		child.stdout.on("data", (chunk) => chunks.push(chunk));
		child.on("error", reject);
		child.on("close", (code) => {
			const output = Buffer.concat(chunks).toString("utf8");
			if (code === 0) {
				resolve(output);
				return;
			}
			reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
		});
	});
}
