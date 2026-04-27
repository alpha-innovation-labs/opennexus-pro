const fs = require("node:fs");
const path = require("node:path");

/**
 * Returns the local node-pty prebuild helper paths that may need execute bits.
 *
 * @returns {string[]} Candidate helper paths.
 */
function getCandidatePaths() {
	const root = path.resolve(__dirname, "..", "..", "node_modules", "node-pty", "prebuilds");
	return [
		path.join(root, "darwin-arm64", "spawn-helper"),
		path.join(root, "darwin-x64", "spawn-helper"),
	];
}

/**
 * Ensures the helper binary is executable when it exists.
 *
 * @param {string} target Helper binary path.
 */
function ensureExecutable(target) {
	if (!fs.existsSync(target)) return;
	const mode = fs.statSync(target).mode;
	const executableMode = mode | 0o755;
	fs.chmodSync(target, executableMode);
	console.log(`node-pty helper ready: ${target}`);
}

for (const target of getCandidatePaths()) {
	ensureExecutable(target);
}
