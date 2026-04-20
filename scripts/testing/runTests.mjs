import { pathToFileURL } from "node:url";
import { parseTestMode } from "./args/parseTestMode.mjs";
import { listTestFiles } from "./files/listTestFiles.mjs";
import { runTsxTests } from "./process/runTsxTests.mjs";

/**
 * Executes the test suite selected by the supported `just test` arguments.
 *
 * @param {string[]} args CLI arguments passed after `just test`.
 * @returns {Promise<number>} Process exit code.
 */
export async function runTests(args) {
  const testMode = parseTestMode(args);
  const testFiles = await listTestFiles(process.cwd(), testMode);

  return runTsxTests(process.cwd(), testFiles);
}

const isMainModule = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const exitCode = await runTests(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  });

  process.exit(exitCode);
}
