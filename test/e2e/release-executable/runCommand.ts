import { spawn } from "node:child_process";

export interface RunCommandOptions {
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
}

export interface RunCommandResult {
  code: number | null;
  output: string;
  timedOut: boolean;
}

/**
 * Runs one shell command and captures combined output.
 *
 * @param command Shell command to execute.
 * @param options Execution options.
 * @returns Process result with combined stdout and stderr.
 */
export async function runCommand(command: string, options: RunCommandOptions): Promise<RunCommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", ["-lc", command], {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, options.timeoutMs);

    child.stdout.on("data", (chunk: Buffer | string) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      output += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output, timedOut });
    });
  });
}
