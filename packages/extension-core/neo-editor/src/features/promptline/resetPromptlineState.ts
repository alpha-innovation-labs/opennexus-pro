import { clearPromptlineConfig } from "./config/clearPromptlineConfig";
import { getUsageRenderUnsubscribe, setPromptlineInstalledForSession, setPromptlineModelOverride, setPromptlineRenderRequest, setUsageRenderUnsubscribe } from "./state";

/**
 * Clears promptline singleton state on session shutdown.
 */
export function resetPromptlineState(): void {
  setPromptlineRenderRequest(undefined);
  setPromptlineModelOverride(undefined);
  setPromptlineInstalledForSession(null);
  clearPromptlineConfig();
  getUsageRenderUnsubscribe()?.();
  setUsageRenderUnsubscribe(undefined);
}
