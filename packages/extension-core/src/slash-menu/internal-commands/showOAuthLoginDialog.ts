import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { defaultModelPerProvider } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/core/model-resolver.js";
import { getAuthPath } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/config.js";
import { LoginDialogComponent } from "../../../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/login-dialog.js";

/**
 * Runs one OAuth login flow inside a custom extension dialog.
 *
 * @param providerId Provider id.
 * @param ctx Command context.
 * @param pi Extension API.
 */
export async function showOAuthLoginDialog(providerId: string, ctx: ExtensionCommandContext, pi: ExtensionAPI): Promise<void> {
  const providerInfo = ctx.modelRegistry.authStorage.getOAuthProviders().find((provider) => provider.id === providerId);
  const providerName = providerInfo?.name ?? providerId;
  const previousModel = ctx.model;
  const usesCallbackServer = providerInfo?.usesCallbackServer ?? false;
  await ctx.ui.custom<void>((tui, _theme, _keybindings, done) => {
    const dialog = new LoginDialogComponent(tui, providerId, () => done());
    void (async () => {
      let manualCodeResolve: ((value: string) => void) | undefined;
      let manualCodeReject: ((reason?: unknown) => void) | undefined;
      const manualCodePromise = new Promise<string>((resolve, reject) => {
        manualCodeResolve = resolve;
        manualCodeReject = reject;
      });
      try {
        await ctx.modelRegistry.authStorage.login(providerId, {
          onAuth: (info) => {
            dialog.showAuth(info.url, info.instructions);
            if (usesCallbackServer) {
              void dialog.showManualInput("Paste redirect URL below, or complete login in browser:")
                .then((value) => manualCodeResolve?.(value))
                .catch((error) => manualCodeReject?.(error));
            }
            else if (providerId === "github-copilot") {
              dialog.showWaiting("Waiting for browser authentication...");
            }
          },
          onPrompt: async (prompt) => dialog.showPrompt(prompt.message, prompt.placeholder),
          onProgress: (message) => dialog.showProgress(message),
          onManualCodeInput: () => manualCodePromise,
          signal: dialog.signal,
        });
        ctx.modelRegistry.refresh();
        const selectedId = defaultModelPerProvider[providerId as keyof typeof defaultModelPerProvider];
        const selectedModel = previousModel?.provider === providerId ? undefined : ctx.modelRegistry.getAvailable().find((model) => model.provider === providerId && model.id === selectedId);
        if (selectedModel) {
          await pi.setModel(selectedModel);
          ctx.ui.notify(`Logged in to ${providerName}. Selected ${selectedModel.id}. Credentials saved to ${getAuthPath()}`, "info");
        } else {
          ctx.ui.notify(`Logged in to ${providerName}. Credentials saved to ${getAuthPath()}`, "info");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message !== "Login cancelled") {
          ctx.ui.notify(`Failed to login to ${providerName}: ${message}`, "error");
        }
      } finally {
        done();
      }
    })();
    return dialog;
  }, { overlay: true, overlayOptions: createPanelOverlayOptions(80, "85%") });
}
