import { relative, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { listTestFiles } from "./files/listTestFiles.mjs";

/**
 * Regex that matches a describe() or test() call at the top of a line
 * (allowing leading whitespace). Captures the string literal argument.
 */
const DESCRIBE_RE = /^\s*describe\(\s*['"]([^'"]+)['"]/m;
const TEST_RE = /^\s*test\(\s*['"]([^'"]+)['"]/m;

/**
 * Parses one test file and returns all discovered test entries.
 *
 * @param {string} filePath - Absolute file path.
 * @param {string} projectRoot - Project root directory.
 * @returns {Array<{filePath: string, group: string|null, name: string, fullPath: string}>} Discovered test entries for this file.
 */
async function parseTestFile(filePath, projectRoot) {
  const content = await readFile(filePath, "utf8");
  const projectRelative = relative(projectRoot, filePath).split("\\").join("/");
  const entries = [];
  let currentGroup = null;

  const lines = content.split("\n");
  for (const line of lines) {
    const descMatch = line.match(DESCRIBE_RE);
    if (descMatch) {
      currentGroup = descMatch[1];
      continue;
    }

    const testMatch = line.match(TEST_RE);
    if (testMatch) {
      const name = testMatch[1];
      const fullPath = currentGroup ? `${currentGroup} > ${name}` : name;
      entries.push({ filePath: projectRelative, group: currentGroup, name, fullPath });
    }
  }

  return entries;
}

/**
 * Discovers all tests across the test directory, grouped by file and
 * describe block. Returns entries sorted by file path, then by order of
 * appearance within the file.
 *
 * @param {string} projectRoot - Root directory of the project.
 * @param {"without-release" | "with-release"} mode - Test mode.
 * @returns {Promise<Array<{filePath: string, group: string|null, name: string, fullPath: string}>>} All discovered test entries.
 */
export async function discoverTests(projectRoot, mode) {
  const testFiles = await listTestFiles(projectRoot, mode);
  const allEntries = [];

  for (const filePath of testFiles) {
    const absolutePath = resolve(projectRoot, filePath);
    const entries = await parseTestFile(absolutePath, projectRoot);
    allEntries.push(...entries);
  }

  return allEntries;
}

/**
 * Formats discovered tests as a human-readable grouped listing.
 *
 * @param {Array<{filePath: string, group: string|null, name: string, fullPath: string}>} tests - Discovered test entries.
 * @returns {string} Formatted text ready for console output.
 */
export function formatTestList(tests) {
  const groups = new Map();
  const noGroup = [];

  for (const test of tests) {
    if (test.group) {
      if (!groups.has(test.group)) groups.set(test.group, []);
      groups.get(test.group).push(test);
    } else {
      noGroup.push(test);
    }
  }

  const lines = [];

  // Grouped tests
  for (const [groupName, groupTests] of groups) {
    lines.push(`  ${groupName}:`);
    for (const t of groupTests) {
      lines.push(`    - ${t.fullPath}`);
    }
    lines.push("");
  }

  // Top-level tests (no describe group)
  if (noGroup.length > 0) {
    lines.push("  Top-level:");
    for (const t of noGroup) {
      lines.push(`    - ${t.fullPath}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
