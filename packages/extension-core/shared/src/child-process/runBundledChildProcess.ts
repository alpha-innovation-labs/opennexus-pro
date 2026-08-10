import { spawn } from "node:child_process";

export interface BundledChildProcessResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export interface RunBundledChildProcessOptions {
  command: string;
  args: string[];
  cwd: string;
  timeout?: number;
}

/**
 * Runs a bundled child process and captures its stdout and stderr.
 *
 * @param options Command, arguments, working directory, and optional timeout.
 * @returns Exit code and captured output.
 */
export async function runBundledChildProcess({
  command,
  args,
  cwd,
  timeout,
}: RunBundledChildProcessOptions): Promise<BundledChildProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NEXUS_DEV_MODE: "1" },
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

    const timer = timeout
      ? setTimeout(() => {
          child.kill();
          reject(new Error(`Child process timed out after ${timeout}ms`));
        }, timeout)
      : null;

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}
