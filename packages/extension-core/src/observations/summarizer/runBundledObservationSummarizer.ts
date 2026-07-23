import { spawn } from "node:child_process";
import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";

export interface BundledSummarizerResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Runs the current Nexus CLI as a lightweight summarizer subprocess.
 *
 * @param args CLI arguments for the summarizer invocation.
 * @param cwd Working directory for the subprocess.
 * @returns Exit code and captured output.
 */
export async function runBundledObservationSummarizer(
  args: string[],
  cwd: string,
): Promise<BundledSummarizerResult> {
  return new Promise((resolve, reject) => {
    const launchSpec = getCurrentNexusLaunchSpec(args);
    const child = spawn(launchSpec.command, launchSpec.args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}
