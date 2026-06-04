import { join, resolve } from "node:path";
import { copyPath } from "./copyPath.mjs";

const EXPORT_HTML_ROOT = resolve("node_modules", "@earendil-works", "pi-coding-agent", "dist", "core", "export-html");

/**
 * Copies the HTML export runtime assets needed by the bundle.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function copyExportHtmlAssets(bundleDir) {
  const destinationRoot = join(bundleDir, "export-html");
  const copies = [
    [join(EXPORT_HTML_ROOT, "ansi-to-html.js"), join(destinationRoot, "ansi-to-html.js")],
    [join(EXPORT_HTML_ROOT, "index.js"), join(destinationRoot, "index.js")],
    [join(EXPORT_HTML_ROOT, "tool-renderer.js"), join(destinationRoot, "tool-renderer.js")],
    [join(EXPORT_HTML_ROOT, "template.css"), join(destinationRoot, "template.css")],
    [join(EXPORT_HTML_ROOT, "template.html"), join(destinationRoot, "template.html")],
    [join(EXPORT_HTML_ROOT, "template.js"), join(destinationRoot, "template.js")],
    [join(EXPORT_HTML_ROOT, "vendor"), join(destinationRoot, "vendor")],
  ];

  for (const [source, destination] of copies) {
    await copyPath(source, destination);
  }
}
