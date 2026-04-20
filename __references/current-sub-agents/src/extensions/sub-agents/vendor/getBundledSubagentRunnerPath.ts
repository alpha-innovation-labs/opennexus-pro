import { basename, extname, join } from "node:path";
import { getBinaryPackageDir } from "../../../runtime/package/getBinaryPackageDir.js";

/**
 * Resolves the compiled async subagent runner binary when available.
 *
 * @returns Absolute runner path for bundled binaries, otherwise null.
 */
export function getBundledSubagentRunnerPath(): string | null {
  const packageDir = getBinaryPackageDir(import.meta.url);
  if (!packageDir) return null;
  const binaryName = basename(process.execPath, extname(process.execPath));
  const suffix = process.platform === "win32" ? ".exe" : "";
  const runnerName = binaryName.endsWith("-subagent-runner")
    ? `${binaryName}${suffix}`
    : `${binaryName}-subagent-runner${suffix}`;
  return join(packageDir, runnerName);
}
