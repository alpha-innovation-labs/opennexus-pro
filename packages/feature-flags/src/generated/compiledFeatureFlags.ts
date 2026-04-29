import type { FeatureFlagsConfig } from "../types.js";

/**
 * Feature flags compiled into the app at build time.
 */
export const compiledFeatureFlags = {
  "extensions": {
    "ai-providers": {
      "enabled": true,
      "features": [
        "oh-my-pi provider login entries",
        "manual credential prompts for additional providers",
        "/login provider availability"
      ]
    },
    "cmux": {
      "enabled": true,
      "features": [
        "sync session title to cmux pane title",
        "notify cmux tab when pane is done",
        "/cmux workspace shell session view"
      ]
    },
    "exit-message": {
      "enabled": true,
      "features": [
        "print session title on app exit"
      ]
    },
    "fff": {
      "enabled": true,
      "features": [
        "FFF-backed read override",
        "FFF-backed grep override",
        "FFF-powered @ file autocomplete"
      ]
    },
    "neo-editor": {
      "enabled": true,
      "features": [
        "custom promptline",
        "slashusage",
        "@ file autocomplete",
        "editor trigger submit",
        "macOS ctrl+v image paste fallback"
      ]
    },
    "notify": {
      "enabled": true,
      "features": [
        "desktop notification on agent completion",
        "macOS submarine sound by default",
        "NEXUS_NOTIFY_SOUND_CMD override"
      ]
    },
    "rtk": {
      "enabled": true,
      "features": [
        "rtk rewrite for bash",
        "rtk-native read/find/ls/grep tools"
      ]
    },
    "startup-hero": {
      "enabled": true,
      "features": [
        "show N logo, version, tips, and startup status"
      ]
    },
    "tron": {
      "enabled": true,
      "features": [
        "compact tool lines",
        "thinking style",
        "tool calls browser",
        "user message bubble"
      ]
    },
    "slashusage": {
      "enabled": true,
      "features": [
        "inline slashusage",
        "5-minute historical usage snapshots",
        "/usage history graph modal"
      ]
    }
  },
  "other": {}
} satisfies FeatureFlagsConfig;
