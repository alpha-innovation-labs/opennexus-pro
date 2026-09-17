import { clearPromptlineConfig } from "./config/clearPromptlineConfig";
import {
	getUsageRenderUnsubscribe,
	setPromptlineInstalledForSession,
	setPromptlineModelOverride,
	setPromptlineRenderRequest,
	setPromptlineProviderPickerOpener,
	setUsageRenderUnsubscribe,
} from "./state";

/**
 * Clears promptline singleton state on session shutdown.
 */
export function resetPromptlineState(): void {
	setPromptlineRenderRequest(undefined);
	setPromptlineProviderPickerOpener(undefined);
	setPromptlineModelOverride(undefined);
	setPromptlineInstalledForSession(null);
	clearPromptlineConfig();
	getUsageRenderUnsubscribe()?.();
	setUsageRenderUnsubscribe(undefined);
}
