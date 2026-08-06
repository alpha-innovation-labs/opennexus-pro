import { runApp } from "../runtime/runApp.js";
import { runCliWithApp } from "./runCliWithApp.js";

/**
 * Runs the Nexus CLI entrypoint.
 *
 * @param argv Raw process arguments.
 * @returns Process exit code.
 */
export async function runCli(argv: string[]): Promise<number> {
  return runCliWithApp(argv, { runApp });
}
