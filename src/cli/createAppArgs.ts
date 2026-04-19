/**
 * Creates the CLI arguments for the bundled Pi app.
 *
 * @param inputArgs Raw arguments passed to the app.
 * @returns Arguments with extension auto-discovery disabled.
 */
export function createAppArgs(inputArgs: string[]): string[] {
  if (inputArgs.includes("--no-extensions")) {
    return inputArgs;
  }

  return ["--no-extensions", ...inputArgs];
}
