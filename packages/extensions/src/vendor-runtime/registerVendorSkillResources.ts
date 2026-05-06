import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getVendorDirectoryPath } from "./getVendorDirectoryPath.js";

/**
 * Adds a vendored package skills directory to Pi resource discovery when present.
 *
 * @param pi Pi extension API.
 * @param vendorId Directory name under packages/extensions/src/vendor.
 */
export function registerVendorSkillResources(pi: ExtensionAPI, vendorId: string): void {
  const skillsPath = join(getVendorDirectoryPath(vendorId), "skills");
  if (!existsSync(skillsPath)) return;
  pi.on("resources_discover", () => ({ skillPaths: [skillsPath] }));
}
