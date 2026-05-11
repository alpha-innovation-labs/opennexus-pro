import { access, readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const appRoot = new URL("..", import.meta.url).pathname;
const maxLines = 200;
const checkedExtensions = new Set([".cjs", ".css", ".html", ".js", ".json", ".mjs", ".ts"]);

/**
 * Lists extension source files recursively.
 *
 * @param {string} directory Directory to inspect.
 * @returns {Promise<string[]>} File paths.
 */
async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return children.flat();
}

/**
 * Counts text file lines.
 *
 * @param {string} path File path.
 * @returns {Promise<number>} Line count.
 */
async function countLines(path) {
  const text = await readFile(path, "utf8");
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

/**
 * Lists file paths referenced by the Chrome extension manifest.
 *
 * @returns {Promise<string[]>} Manifest-relative file paths.
 */
async function listManifestReferencedFiles() {
  const manifest = JSON.parse(await readFile(join(appRoot, "manifest.json"), "utf8"));
  return [
    manifest.background?.service_worker,
    manifest.action?.default_popup,
    ...Object.values(manifest.icons || {}),
    ...(manifest.content_scripts || []).flatMap((script) => [...(script.css || []), ...(script.js || [])]),
  ].filter(Boolean);
}

const files = (await listFiles(appRoot)).filter((file) => checkedExtensions.has(extname(file)));
const oversized = [];
for (const file of files) {
  const lineCount = await countLines(file);
  if (lineCount > maxLines) oversized.push(`${relative(appRoot, file)}: ${lineCount}`);
  if ([".cjs", ".js", ".mjs"].includes(extname(file))) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  }
}
for (const manifestFile of await listManifestReferencedFiles()) {
  await access(join(appRoot, manifestFile));
}
if (oversized.length > 0) throw new Error(`Files exceed ${maxLines} lines:\n${oversized.join("\n")}`);
console.log(`Checked ${files.length} extension source files; no oversized files found.`);
