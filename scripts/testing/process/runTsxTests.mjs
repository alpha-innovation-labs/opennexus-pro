import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createTsxTestArgs } from "./createTsxTestArgs.mjs";
import { resolveTestConcurrency } from "./resolveTestConcurrency.mjs";

/**
 * Runs the selected test files through the local `tsx` binary.
 *
 * @param {string} projectRoot Root directory of the project.
 * @param {string[]} testFiles Project-relative test file paths.
 * @returns {Promise<number>} Child-process exit code.
 */
export async function runTsxTests(projectRoot, testFiles) {
  return new Promise((resolvePromise, reject) => {
    const tsxBinaryPath = resolve(
      projectRoot,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "tsx.cmd" : "tsx",
    );
    const testConcurrency = resolveTestConcurrency();
    const testArgs = createTsxTestArgs(testFiles, testConcurrency);
    const child = spawn(tsxBinaryPath, testArgs, {
      cwd: projectRoot,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolvePromise(code ?? 1);
    });
  });
}
