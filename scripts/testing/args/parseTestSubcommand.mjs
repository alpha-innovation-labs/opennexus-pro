/**
 * Parses the supported `just test` subcommands and arguments.
 *
 * Returns an object describing the requested action, the test mode
 * (without-release | with-release), and any file/group filters.
 *
 * Supported subcommands:
 *   list              — discover and print all tests, grouped
 *   run-all           — run every selected test file
 *   run-group <name>  — run tests matching a describe group name
 *   run-test <name>   — run a single test by its full path (describe > test)
 *
 * Supported flags (appended to any subcommand):
 *   --with-release    — include release-dependent e2e tests
 *
 * @param {string[]} args CLI arguments passed after `just test`.
 * @returns {{ subcommand: "list" | "run-all" | "run-group" | "run-test" | "help"; mode: "without-release" | "with-release"; group?: string; testName?: string; testFiles?: string[] }}
 */
export function parseTestSubcommand(args) {
  // Extract --with-release flag
  let mode = /** @type {"without-release" | "with-release"} */ ("without-release");
  const filteredArgs = args.filter((a) => {
    if (a === "--with-release") {
      mode = "with-release";
      return false;
    }
    return true;
  });

  // No args → show the menu (default behaviour of "just test").
  if (filteredArgs.length === 0) {
    return { subcommand: "menu", mode };
  }

  // `just` passes {{ARGS}} as a single space-joined string.
  // "run-group pi-chrome integration" → ["run-group pi-chrome integration"]
  // Split on the first space to recover subcommand + remainder.
  const firstArg = filteredArgs[0];
  const spaceIdx = firstArg.indexOf(" ");

  let subcommand;
  let remainder = null;

  if (spaceIdx !== -1) {
    subcommand = firstArg.slice(0, spaceIdx);
    remainder = firstArg.slice(spaceIdx + 1);
  } else {
    subcommand = firstArg;
  }

  switch (subcommand) {
    case "list":
      return { subcommand: "list", mode };

    case "run-all":
      return { subcommand: "run-all", mode };

    case "run-group": {
      const groupName = remainder;
      if (!groupName) {
        throw new Error(
          'Usage: just test run-group "<group-name>" [--with-release]\n' +
            '  <group-name> is the describe() block name (e.g. "pi-chrome integration").',
        );
      }
      return { subcommand: "run-group", mode, group: groupName };
    }

    case "run-test": {
      const testName = remainder;
      if (!testName) {
        throw new Error(
          'Usage: just test run-test "<test-name>" [--with-release]\n' +
            '  <test-name> is the full path "describe > test" (e.g. "pi-chrome integration > command present").',
        );
      }
      return { subcommand: "run-test", mode, testName };
    }

    case "help":
      return { subcommand: "help", mode };

    default:
      throw new Error(
        `Unknown subcommand "${subcommand}". Use: list, run-all, run-group, run-test, help`,
      );
  }
}
