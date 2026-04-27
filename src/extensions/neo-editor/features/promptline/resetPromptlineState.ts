import { clearPromptlineConfig } from "./config/clearPromptlineConfig.js";
import { getUsageRenderUnsubscribe, setPromptlineInstalledForSession, setPromptlineRenderRequest, setUsageRenderUnsubscribe } from "./state.js";

/**
 * Clears promptline singleton state on session shutdown.
 */
export function resetPromptlineState(): void {
  setPromptlineRenderRequest(undefined);
  setPromptlineInstalledForSession(null);
  clearPromptlineConfig();
  getUsageRenderUnsubscribe()?.();
  setUsageRenderUnsubscribe(undefined);
}
