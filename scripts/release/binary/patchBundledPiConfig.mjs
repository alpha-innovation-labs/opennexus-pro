import { readFile, writeFile } from "node:fs/promises";

/**
 * Patches Pi's bundled package-dir lookup so compiled Nexus binaries
 * resolve assets from the launched binary path more reliably.
 *
 * @param {string} bundledEntryPath Bundled JavaScript entry path.
 * @returns {Promise<void>}
 */
export async function patchBundledPiConfig(bundledEntryPath) {
  const sourceCode = await readFile(bundledEntryPath, "utf8");
  const dirnameMatch = sourceCode.match(/if \(isBunBinary\) {\n\s+return (dirname\d*)\(process\.execPath\);\n\s+}\n\s+let dir = __dirname2;/);
  const joinMatch = sourceCode.match(/existsSync\d*\((join\d*)\(dir, "package\.json"\)\)/);

  if (!dirnameMatch || !joinMatch) {
    throw new Error("Failed to patch bundled Pi package-dir lookup.");
  }

  const [, dirnameAlias] = dirnameMatch;
  const [, joinAlias] = joinMatch;
  const oldSnippet = `  if (isBunBinary) {\n    return ${dirnameAlias}(process.execPath);\n  }\n`;
  const newSnippet = [
    "  if (isBunBinary) {",
    "    const launchedBinaryPath = process.argv0 || process.argv[0] || process.execPath;",
    `    const absoluteBinaryPath = launchedBinaryPath.startsWith("/") ? launchedBinaryPath : ${joinAlias}(process.cwd(), launchedBinaryPath);`,
    `    return ${dirnameAlias}(absoluteBinaryPath);`,
    "  }",
    "",
  ].join("\n");

  await writeFile(bundledEntryPath, sourceCode.replace(oldSnippet, newSnippet), "utf8");
}
