/**
 * Lightweight CLI handler that avoids importing heavy packages
 * (mini-apps, runtime, pi-platform) for CLI-only commands.
 *
 * These commands never need the full app runtime — they just need
 * simple file I/O and argument parsing. Import this from index.ts
 * and run it synchronously before importing the heavy runCliWithApp.
 *
 * Returns true if the command was handled (and should exit).
 */
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hasFactoryFlag, runFactoryCommand } from "@nexus/factory";
import { hasHelpFlag } from "./help/hasHelpFlag";
import { printNexusUsage } from "./help/printNexusUsage";
import { hasVersionFlag } from "./version/hasVersionFlag";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Reads the Nexus version from package.json — inlined to avoid
 * importing @nexus/runtime (which loads 20+ modules).
 */
async function readCliPackageVersion(): Promise<string> {
	const piPackageDir = process.env.PI_PACKAGE_DIR;
	if (piPackageDir) {
		const expanded = piPackageDir.startsWith("~")
			? join(process.env.HOME ?? "", piPackageDir.slice(1))
			: piPackageDir;
		const pjsonPath = join(expanded, "package.json");
		try {
			const data = JSON.parse(await readFile(pjsonPath, "utf8"));
			return String(data.version ?? "0.1.0");
		} catch {
			return "0.1.0";
		}
	}
	// Dev mode: read from the TUI app's package.json
	const packageJsonPath = resolve(__dirname, "../../package.json");
	try {
		const data = JSON.parse(await readFile(packageJsonPath, "utf8"));
		return String(data.version ?? "0.1.0");
	} catch {
		return "0.1.0";
	}
}

export async function runLightweightCli(
	argv: string[],
): Promise<boolean> {
	if (hasVersionFlag(argv)) {
		console.log(await readCliPackageVersion());
		return true;
	}

	if (hasHelpFlag(argv)) {
		printNexusUsage();
		return true;
	}

	if (hasFactoryFlag(argv)) {
		await runFactoryCommand(argv);
		return true;
	}

	// Not a lightweight CLI command — fall through to runCliWithApp.
	return false;
}
