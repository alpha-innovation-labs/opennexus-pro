import { spawn } from "node:child_process";

/**
 * Runs a Bun build command and fails on non-zero exit codes.
 *
 * @param {string[]} args Bun CLI arguments.
 * @returns {Promise<void>}
 */
export function runBunBuild(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`bun ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });
  });
}
