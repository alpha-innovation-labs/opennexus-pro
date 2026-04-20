import { runSubagentRunnerCli as runRunner } from "./subagent-runner.ts";

export { runRunner as runSubagentRunnerCli };

/**
 * Boots the standalone subagent runner script.
 *
 * @returns Promise that resolves when the runner completes.
 */
async function main(): Promise<void> {
  await runRunner(process.argv.slice(2));
}

main().catch((error) => {
  console.error("Subagent runner error:", error);
  process.exit(1);
});
