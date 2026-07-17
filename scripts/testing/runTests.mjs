import { pathToFileURL } from "node:url";
import { parseTestSubcommand } from "./args/parseTestSubcommand.mjs";
import { discoverTests, formatTestList } from "./listTests.mjs";
import { runTsxTests } from "./process/runTsxTests.mjs";

/**
 * Dispatches a test subcommand: list, run-all, run-group, run-test.
 *
 * @param {string[]} args CLI arguments passed after `just test`.
 * @returns {Promise<number>} Process exit code.
 */
export async function runTests(args) {
  const parsed = parseTestSubcommand(args);

  switch (parsed.subcommand) {
    case "list": {
      const tests = await discoverTests(process.cwd(), parsed.mode);
      console.log(`\nDiscovered ${tests.length} test(s):\n`);
      console.log(formatTestList(tests));
      return 0;
    }

    case "help": {
      console.log(`
Usage:
  just test [subcommand] [--with-release]

Subcommands:
  list                        List all discovered tests, grouped by describe()
  run-all                     Run every selected test file (default)
  run-group <group-name>      Run tests matching a describe group name
  run-test <test-name>        Run a single test by its full "describe > test" path

Flags:
  --with-release              Include release-dependent e2e tests

Examples:
  just test list
  just test run-all
  just test run-group "pi-chrome integration" --with-release
  just test run-test "pi-chrome integration > command present"
`);
      return 0;
    }

    case "menu": {
      // Default when called with no subcommand — show the menu.
      console.log(`
Usage:
  just test [subcommand] [--with-release]

Subcommands:
  list                        List all discovered tests, grouped by describe()
  run-all                     Run every selected test file (default)
  run-group <group-name>      Run tests matching a describe group name
  run-test <test-name>        Run a single test by its full "describe > test" path

Flags:
  --with-release              Include release-dependent e2e tests

Examples:
  just test list
  just test run-all
  just test run-group "pi-chrome integration" --with-release
  just test run-test "pi-chrome integration > command present"
`);
      return 0;
    }

    case "run-all":
    case "run-group":
    case "run-test": {
      const testFiles = await import("./files/listTestFiles.mjs").then(
        (m) => m.listTestFiles,
      );

      // For run-group / run-test, we still need to discover the full
      // test list to resolve the group or test name to actual files.
      if (parsed.subcommand === "run-group" || parsed.subcommand === "run-test") {
        const allTests = await discoverTests(process.cwd(), parsed.mode);

        if (parsed.subcommand === "run-group") {
          const matchingTests = allTests.filter(
            (t) => t.group === parsed.group,
          );
          if (matchingTests.length === 0) {
            console.error(`No tests found for group "${parsed.group}".`);
            console.log("\nAvailable groups:");
            const groups = new Set(allTests.map((t) => t.group).filter(Boolean));
            for (const g of [...groups].sort()) {
              console.log(`  - ${g}`);
            }
            return 1;
          }
          // Run only the files that contain matching tests
          const targetFiles = [...new Set(matchingTests.map((t) => t.filePath))];
          return await runTsxTests(process.cwd(), targetFiles);
        }

        if (parsed.subcommand === "run-test") {
          const matchingTests = allTests.filter(
            (t) => t.fullPath === parsed.testName,
          );
          if (matchingTests.length === 0) {
            console.error(`No test found for "${parsed.testName}".`);
            console.log("\nAvailable tests:");
            for (const t of allTests.map((t) => t.fullPath).sort()) {
              console.log(`  - ${t}`);
            }
            return 1;
          }
          // Run only the file containing the matching test
          const targetFiles = [...new Set(matchingTests.map((t) => t.filePath))];
          return await runTsxTests(process.cwd(), targetFiles);
        }
      }

      // run-all: run every file
      const testFilesList = await testFiles(process.cwd(), parsed.mode);
      return await runTsxTests(process.cwd(), testFilesList);
    }
  }
}

const isMainModule = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const exitCode = await runTests(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  });

  process.exit(exitCode);
}
