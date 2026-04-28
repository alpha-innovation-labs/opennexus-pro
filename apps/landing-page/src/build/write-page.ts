import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { renderPage } from "../app/render-page.js";

/**
 * Writes the rendered landing page document to disk.
 *
 * @param targetPath HTML file path to write.
 * @returns Promise that resolves after the page is written.
 */
export async function writePage(targetPath: string): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, renderPage(), "utf8");
}
