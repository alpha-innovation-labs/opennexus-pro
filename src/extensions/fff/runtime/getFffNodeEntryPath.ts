import { createRequire } from "node:module";
import { join } from "node:path";

/**
 * Resolves the FFF module entrypoint from the installed package root.
 *
 * @returns Absolute FFF module entry path.
 */
export function getFffNodeEntryPath(): string {
  if (process.env.PI_PACKAGE_DIR) {
    return join(process.env.PI_PACKAGE_DIR, "node_modules", "@ff-labs", "fff-node", "dist", "src", "index.js");
  }

  return createRequire(import.meta.url).resolve("@ff-labs/fff-node");
}
