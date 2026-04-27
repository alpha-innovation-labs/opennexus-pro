import { execSync } from "node:child_process";

/**
 * Detects the Linux libc family used by the current host.
 *
 * @returns {"gnu" | "musl"} Detected libc family.
 */
export function detectLinuxLibcKind() {
  try {
    const output = execSync("ldd --version 2>&1", { encoding: "utf8", timeout: 5000 });
    return output.toLowerCase().includes("musl") ? "musl" : "gnu";
  } catch {
    return "gnu";
  }
}
