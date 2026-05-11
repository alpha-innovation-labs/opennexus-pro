import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const packageJsonPath = resolve("package.json");
const outputPath = resolve("packages/extension-core/src/auto-update/runtime/packageInfo.generated.ts");

/**
 * Generates hardcoded package metadata from the root package.json.
 *
 * @returns {Promise<void>}
 */
async function generatePackageInfo() {
	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
	const name = typeof packageJson.name === "string" ? packageJson.name : "opennexus";
	const version = typeof packageJson.version === "string" ? packageJson.version : "unknown";
	const source = [
		"/**",
		" * Package metadata generated from the root package.json.",
		" */",
		`export const generatedPackageInfo = ${JSON.stringify({ name, version }, null, 2)} as const;`,
		"",
	].join("\n");
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, source, "utf8");
}

await generatePackageInfo();
