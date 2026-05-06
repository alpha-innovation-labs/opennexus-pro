/**
 * rpiv-ask-user-question — Pi extension. Registers the `ask_user_question`
 * tool: a structured option selector with a free-text "Other" fallback.
 *
 * Sentinel labels and TUI chrome strings localize at render time via the i18n
 * bridge. Strings are registered with rpiv-i18n here, once, at module init —
 * but only when the SDK is actually installed. If `@juicesharp/rpiv-i18n` is
 * missing (standalone install of just this package), the dynamic-load shim
 * no-ops and the bridge's `t(key, fallback)` returns the inline English literal
 * at every call site. The extension stays online either way.
 *
 * Adding a locale: drop `locales/<code>.json` next to en.json (mirroring the
 * key set), then add the load + entry to the `registerStrings` call below.
 * See `@juicesharp/rpiv-i18n` README → "Contributing translations" for the
 * full convention.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { localeMaps, type TranslationMap } from "./localeMaps.js";
import { registerAskUserQuestionTool } from "./ask-user-question.js";
import { I18N_NAMESPACE } from "./state/i18n-bridge.js";

type I18nSDK = { registerStrings: (namespace: string, byLocale: Record<string, TranslationMap>) => void };

// Dynamic import keeps `@juicesharp/rpiv-i18n` a soft optional peer: when the
// SDK is installed alongside this package the strings register and
// `/languages` flips them live; when it isn't, the import rejects here, we
// no-op, and the bridge's English-fallback shim keeps the extension online.
try {
	const sdk = (await import("@juicesharp/rpiv-i18n")) as I18nSDK;
	sdk.registerStrings(I18N_NAMESPACE, localeMaps);
} catch {
	// SDK absent — extension still loads with English-only UI.
}

export default function (pi: ExtensionAPI) {
	registerAskUserQuestionTool(pi);
}
