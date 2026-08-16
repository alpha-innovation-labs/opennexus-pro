import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Lists available factories from `.factory/` and `examples/`.
 *
 * On first run, creates the local `.factory/` directory if it doesn't exist.
 *
 * @returns Process exit code.
 */
export async function runFactoryList(): Promise<number> {
	const cwd = process.cwd();
	const factoryDir = join(cwd, ".factory");

	// Ensure .factory/ exists on startup.
	if (!existsSync(factoryDir)) {
		const { mkdirSync } = await import("node:fs");
		mkdirSync(factoryDir, { recursive: true });
	}

	const factoryFiles: Array<{ name: string; path: string; source: string }> = [];

	// Read from .factory/ directory (user-created factories).
	if (existsSync(factoryDir) && statSync(factoryDir).isDirectory()) {
		const items = readdirSync(factoryDir);
		for (const item of items) {
			const fullPath = join(factoryDir, item);
			if (statSync(fullPath).isFile()) {
				factoryFiles.push({ name: item, path: fullPath, source: ".factory" });
			}
		}
	}

	// Read from examples/ directory (bundled templates).
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
