const { readdirSync, readFileSync } = await import("node:fs");
const { join, dirname } = await import("node:path");
const { fileURLToPath } = await import("node:url");

const R = "[0m";
const B = "[1m";
const _CY = "[36m";
const GR = "[32m";
const OR = "[33m";
const PU = "[35m";

function c(color: string, text: string): string {
	return `${color}${text}${R}`;
}

const testDir = dirname(fileURLToPath(import.meta.url));
const testBase = testDir;

function findTestFiles(dir: string): string[] {
	const results = [];
	const entries = readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...findTestFiles(fullPath));
		} else if (entry.name === "index.test.ts") {
			results.push(fullPath);
		}
	}
	return results.sort();
}

function parseTestFile(filePath) {
	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const blocks = [];
	let currentDescribe = null;
	let currentTests = [];

	for (const rawLine of lines) {
		const trimmed = rawLine.trim();
		const describeMatch = trimmed.match(/^\s*describe\(\s*["'](.+?)["']/);
		const itMatch = trimmed.match(/^\s*it\(\s*["'](.+?)["']/);

		if (describeMatch) {
			if (currentDescribe !== null) {
				blocks.push({ describe: currentDescribe, tests: currentTests });
			}
			currentDescribe = describeMatch[1];
			currentTests = [];
		} else if (itMatch && currentDescribe !== null) {
			currentTests.push(itMatch[1]);
		}
	}

	if (currentDescribe !== null) {
		blocks.push({ describe: currentDescribe, tests: currentTests });
	}

	return blocks;
}

const files = findTestFiles(testDir);

for (const file of files) {
	const relative = join("test", ...file.split(`${testBase}/`).slice(1));
	const blocks = parseTestFile(file);
	for (const block of blocks) {
		console.log(`${c(PU + B, block.describe)} -- ${c(OR, relative)}`);
		for (const test of block.tests) {
			console.log(c(GR, "    - ") + test);
		}
	}
	console.log();
}

console.log();
