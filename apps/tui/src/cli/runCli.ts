import { runApp } from "../runtime/runApp";
import { runCliWithApp } from "./runCliWithApp";

/**
 * Runs the Nexus CLI entrypoint.
 *
 * @param argv Raw process arguments.
 * @returns Process exit code.
 */
export async function runCli(argv: string[]): Promise<number> {
  return runCliWithApp(argv, { runApp });
}
