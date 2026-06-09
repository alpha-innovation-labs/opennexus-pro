#!/usr/bin/env node
import { sendTelemetryEventSafely } from "@nexus/observability/telemetry/sendTelemetryEventSafely.js";
import { getErrorCategory } from "@nexus/observability/telemetry/getErrorCategory.js";
import { runCliWithApp } from "./cli/runCliWithApp.js";
import { runApp } from "./runtime/runApp.js";

/**
 * Boots the installed Nexus executable.
 *
 * @returns {Promise<void>}
 */
async function main() {
  process.exitCode = await runCliWithApp(process.argv.slice(2), { runApp });
}

main().catch(async (error) => {
  await sendTelemetryEventSafely("app.crash", {
    "error.category": getErrorCategory(error),
  });
  console.error(error);
  process.exit(1);
});
