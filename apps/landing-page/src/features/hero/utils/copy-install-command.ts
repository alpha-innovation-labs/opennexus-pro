/**
 * Copies the displayed install command to the system clipboard when available.
 *
 * @param command Install command text to copy.
 * @returns Whether the copy operation completed.
 */
export async function copyInstallCommand(command: string): Promise<boolean> {
  if (!navigator.clipboard) return false;

  try {
    await navigator.clipboard.writeText(command);
    return true;
  } catch {
    return false;
  }
}
