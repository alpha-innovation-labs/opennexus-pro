import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Creates an isolated HOME directory for release-install e2e tests.
 *
 * @returns Temporary HOME path.
 */
export async function createReleaseTestHome(): Promise<string> {
  return mkdtemp(join(tmpdir(), "nexus-release-home-"));
}
