import type { FeatureFlagsConfig } from "./types.js";

/**
 * Returns the feature-flag config embedded into native bundles.
 *
 * @returns Bundled feature-flag config.
 */
export function getBundledFeatureFlagsConfig(): FeatureFlagsConfig {
  return {
    extensions: {
      annotate: {
        enabled: true,
        features: ["annotate command", "annotate tool", "chrome extension bridge"],
      },
      cmux: {
        enabled: true,
        features: ["sync session title to cmux pane title"],
      },
      "neo-editor": {
        enabled: true,
        features: ["custom promptline", "usage meter", "@ file autocomplete", "editor trigger submit"],
      },
      observations: {
        enabled: true,
        features: ["observation tracking", "status widget", "/observations command"],
      },
      "exit-message": {
        enabled: true,
        features: ["print session title on app exit"],
      },
      "startup-logo": {
        enabled: true,
        features: ["show N logo on fresh startup"],
      },
      "term-modal": {
        enabled: true,
        features: ["persistent shell", "/term commands", "terminal shortcuts"],
      },
      todo: {
        enabled: true,
        features: ["todo modal", "ctrl+\\ shortcut"],
      },
      tron: {
        enabled: true,
        features: ["compact tool lines", "thinking style", "tool calls browser", "user message bubble"],
      },
      playground: {
        enabled: false,
        features: ["playground modal", "ctrl+i shortcut"],
      },
      workspace: {
        enabled: false,
        features: ["session switcher", "ctrl+; shortcut", "workspace top bar"],
      },
    },
  };
}
