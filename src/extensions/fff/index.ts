import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerFffExtension } from "./registerFffExtension.js";

/**
 * Registers the bundled FFF extension surface.
 *
 * Adapted from the upstream `pi-fff` project:
 * https://github.com/ShpetimA/pi-fff
 *
 * @param pi Pi extension API.
 */
export default function registerFffBundle(pi: ExtensionAPI): void {
  registerFffExtension(pi);
}
