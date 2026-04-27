import { readFile } from "node:fs/promises";
import path from "node:path";
import { getBundleOutputDir } from "./getBundleOutputDir.js";

/**
 * Reads a generated browser asset from the local e2e bundle directory.
 */
export async function readBundleAsset(fileName: string): Promise<string> {
  return readFile(path.join(getBundleOutputDir(), fileName), "utf8");
}
