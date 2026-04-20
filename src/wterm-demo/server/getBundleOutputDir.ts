import path from "node:path";

/**
 * Returns the generated asset directory for the wterm demo bundle.
 */
export function getBundleOutputDir(): string {
  return path.join(process.cwd(), ".nexus", "wterm-demo");
}
