import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const clipboard = require("@mariozechner/clipboard") as {
  setImageBinary(bytes: Array<number>): Promise<void>;
};

/**
 * Loads one image file into the native clipboard for clipboard-paste tests.
 *
 * @param path Absolute or relative image path.
 */
export async function setClipboardImageFromFile(path: string): Promise<void> {
  const imageBytes = await readFile(path);
  await clipboard.setImageBinary([...imageBytes]);
}
