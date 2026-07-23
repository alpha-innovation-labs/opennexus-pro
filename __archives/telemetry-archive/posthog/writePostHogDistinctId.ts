import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Persists an anonymous PostHog distinct id locally.
 *
 * @param filePath Distinct id file path.
 * @param distinctId Anonymous distinct id.
 */
export async function writePostHogDistinctId(filePath: string, distinctId: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${distinctId}\n`, { mode: 0o600 });
}
