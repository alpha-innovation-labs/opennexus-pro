import { Loader } from "@mariozechner/pi-tui";

let workingLoaderSilencePatchApplied = false;

/**
 * Hides Pi's default interactive "Working..." loader while leaving other loaders intact.
 */
export function applyWorkingLoaderSilencePatch(): void {
  if (workingLoaderSilencePatchApplied) {
    return;
  }

  const prototype = Loader.prototype as Loader & {
    message?: string;
    render(width: number): string[];
  };
  const originalRender = prototype.render;

  prototype.render = function renderWithoutDefaultWorkingLoader(width: number): string[] {
    const message = this.message ?? "";
    if (message.startsWith("Working...")) {
      return [];
    }

    return originalRender.call(this, width);
  };

  workingLoaderSilencePatchApplied = true;
}
