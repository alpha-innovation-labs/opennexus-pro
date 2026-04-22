import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FFF_NODE_RELATIVE_ENTRY = join("@ff-labs", "fff-node", "dist", "src", "index.js");

/**
 * Resolves the packaged FFF entrypoint for source, release-package, and bundle layouts.
 *
 * @returns Absolute FFF module entry path.
 */
export function getFffNodeEntryPath(): string {
  const execDir = dirname(process.execPath);
  const configuredPackageDir = process.env.PI_PACKAGE_DIR;
  const candidatePaths = [
    join(execDir, "node_modules", FFF_NODE_RELATIVE_ENTRY),
    join(execDir, "package", "node_modules", FFF_NODE_RELATIVE_ENTRY),
    configuredPackageDir ? join(configuredPackageDir, "node_modules", FFF_NODE_RELATIVE_ENTRY) : undefined,
    configuredPackageDir ? join(configuredPackageDir, "package", "node_modules", FFF_NODE_RELATIVE_ENTRY) : undefined,
    fileURLToPath(new URL("../../../../node_modules/@ff-labs/fff-node/dist/src/index.js", import.meta.url)),
  ];

  for (const candidatePath of candidatePaths) {
    if (candidatePath && existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return candidatePaths.at(-1)!;
}
