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
  const oldSnippet = "  if (isBunBinary) {\n    return dirname2(process.execPath);\n  }\n";
  const newSnippet = [
    "  if (isBunBinary) {",
    "    const launchedBinaryPath = process.argv0 || process.argv[0] || process.execPath;",
    "    const absoluteBinaryPath = launchedBinaryPath.startsWith(\"/\") ? launchedBinaryPath : join7(process.cwd(), launchedBinaryPath);",
    "    return dirname2(absoluteBinaryPath);",
    "  }",
    "",
  ].join("\n");

  if (!sourceCode.includes(oldSnippet)) {
    throw new Error("Failed to patch bundled Pi package-dir lookup.");
  }

  await writeFile(bundledEntryPath, sourceCode.replace(oldSnippet, newSnippet), "utf8");
}
