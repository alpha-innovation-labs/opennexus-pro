import type { Loader } from "@mariozechner/pi-tui";

/**
 * Runtime shape used to patch pi-tui's loader internals.
 */
export type PatchableLoader = Loader & {
  message?: string;
  updateDisplay(): void;
};
