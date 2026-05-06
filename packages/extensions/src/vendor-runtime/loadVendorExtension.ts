import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

type VendorExtensionModule = {
  default?: (pi: ExtensionAPI) => void | Promise<void>;
};

/**
 * Loads and registers one vendored Pi extension module.
 *
 * @param modulePromise Dynamic import promise for the vendored module.
 * @param pi Pi extension API passed through to the vendored extension.
 */
export async function loadVendorExtension(modulePromise: Promise<VendorExtensionModule>, pi: ExtensionAPI): Promise<void> {
  const module = await modulePromise;
  if (typeof module.default !== "function") {
    throw new Error("Vendored extension module does not export a default registration function.");
  }
  await module.default(pi);
}
