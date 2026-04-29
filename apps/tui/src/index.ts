#!/usr/bin/env node
import { sendTelemetryEventSafely } from "@nexus/observability/telemetry/sendTelemetryEventSafely.js";
import { getErrorCategory } from "@nexus/observability/telemetry/getErrorCategory.js";
import { runCli } from "./cli/runCli.js";

/**
 * Boots the installed Nexus executable.
 *
 * @returns {Promise<void>}
 */
async function main() {
  process.exitCode = await runCli(process.argv.slice(2));
}

main().catch(async (error) => {
  await sendTelemetryEventSafely("app.crash", {
    "error.category": getErrorCategory(error),
  });
  console.error(error);
  process.exit(1);
});
