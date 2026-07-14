import { execFile, type ExecFileException } from "node:child_process";

/**
 * Runs one TypeScript probe against the installed release asset directory.
 *
 * @param cwd Probe working directory.
 * @param env Probe environment.
 * @param script Inline TypeScript source.
 * @returns Combined probe output.
 */
export async function runReleaseAssetProbe(cwd: string, env: NodeJS.ProcessEnv, script: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    execFile(
      "npx",
      ["tsx", "-e", script],
      {
        cwd,
        env,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout}${stderr}`;
        if (!error) {
          resolve(output);
          return;
        }
        const execError = error as ExecFileException;
        if (execError.killed || execError.signal) {
          resolve(output);
          return;
        }
        reject(new Error(output || execError.message));
      },
    );
  });
}
