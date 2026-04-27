import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const RTK_INSTALL_COMMAND = "curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh";

/**
 * Installs RTK with the official Linux/macOS/WSL shell installer.
 *
 * @param pi Pi extension API.
 * @param cwd Current working directory.
 * @param signal Optional abort signal.
 * @returns True when the installer exits successfully.
 */
export async function installRtkForUnixLike(pi: ExtensionAPI, cwd: string, signal?: AbortSignal): Promise<boolean> {
  if (process.platform === "win32") return false;
  try {
    const result = await pi.exec("sh", ["-c", RTK_INSTALL_COMMAND], { cwd, signal, timeout: 120000 } as never);
    return result.code === 0;
  } catch {
    return false;
  }
}
