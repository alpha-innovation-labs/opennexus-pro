/**
 * todo — Pi extension. Registers the `todo` tool, `/todos` slash
 * command, and the persistent TodoOverlay widget.
 *
 * TUI chrome strings localize at render time via the i18n bridge. Strings are
 * registered with i18n here, once, at module init — but only when the
 * SDK is actually installed. If `@juicesharp/rpiv-i18n` is missing (standalone
 * install of just this package), the dynamic-load shim no-ops and the bridge's
 * `t(key, fallback)` returns the inline English literal at every call site.
 * The extension stays online either way.
 *
 * Adding a locale: drop `locales/<code>.json` next to en.json (mirroring the
 * key set), then add the load + entry to the `registerStrings` call below.
 * See the shared i18n SDK README for the full translation convention.
 *
 * Extracted from Nexus@7525a5d. Tool name "todo" and widget key
 * "todos" preserved verbatim so existing session history replays
 * correctly after upgrade.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { localeMaps, type TranslationMap } from "./localeMaps.js";
import { I18N_NAMESPACE } from "./state/i18n-bridge.js";
import { replayFromBranch } from "./state/replay.js";
import { replaceState } from "./state/store.js";
import { registerTodosCommand, registerTodoTool, TOOL_NAME } from "./todo.js";
import { TodoOverlay } from "./todo-overlay.js";

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
	// Todo overlay widget — constructed lazily at the first session_start with UI.
	let todoOverlay: TodoOverlay | undefined;

	registerTodoTool(pi);
	registerTodosCommand(pi);

	pi.on("session_start", async (_event, ctx) => {
		replaceState(replayFromBranch(ctx));
		if (ctx.hasUI) {
			todoOverlay ??= new TodoOverlay();
			todoOverlay.setUICtx(ctx.ui);
			todoOverlay.resetCompletedDisplayState();
			todoOverlay.update();
		}
	});

	pi.on("session_compact", async (_event, ctx) => {
		replaceState(replayFromBranch(ctx));
		todoOverlay?.resetCompletedDisplayState();
		todoOverlay?.update();
	});

	pi.on("session_tree", async (_event, ctx) => {
		replaceState(replayFromBranch(ctx));
		todoOverlay?.resetCompletedDisplayState();
		todoOverlay?.update();
	});

	pi.on("session_shutdown", async () => {
		todoOverlay?.dispose();
		todoOverlay = undefined;
	});

	// Reads getTodos() at render time; do NOT call replayFromBranch here
	// (branch is stale — message_end runs after tool_execution_end).
	pi.on("tool_execution_end", async (event) => {
		if (event.toolName !== TOOL_NAME || event.isError) return;
		todoOverlay?.update();
	});

	pi.on("agent_start", async () => {
		todoOverlay?.hideCompletedTasksFromPreviousTurn();
	});
}
