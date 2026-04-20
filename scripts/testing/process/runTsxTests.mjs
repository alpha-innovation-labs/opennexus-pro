import { spawn } from "node:child_process";
import { resolve } from "node:path";

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
    const child = spawn(tsxBinaryPath, ["--test", ...testFiles], {
      cwd: projectRoot,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolvePromise(code ?? 1);
    });
  });
}
