import type { FeatureFlagsConfig } from "../types.js";

/**
 * Feature flags compiled into the app at build time.
 */
export const compiledFeatureFlags = {
  "extensions": {
    "annotate": {
      "enabled": true,
      "features": [
        "annotate command",
        "annotate tool",
        "chrome extension bridge"
      ]
    },
    "cmux": {
      "enabled": true,
      "features": [
        "sync session title to cmux pane title",
        "notify cmux tab when pane is done"
      ]
    },
    "context-usage": {
      "enabled": true,
      "features": [
        "context_usage tool for current chat context window usage"
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
    "rtk": {
      "enabled": true,
      "features": [
        "rtk rewrite for bash",
        "rtk-native read/find/ls/grep tools"
      ]
    },
    "kanban": {
      "enabled": true,
      "features": [
        "/extension command",
        "two-pane task board modal",
        "temporary in-loop and completed task data"
      ]
    },
    "neo-editor": {
      "enabled": true,
      "features": [
        "custom promptline",
        "usage meter",
        "@ file autocomplete",
        "editor trigger submit",
        "macOS ctrl+v image paste fallback"
      ]
    },
    "observations": {
      "enabled": true,
      "features": [
        "observation tracking",
        "status widget",
        "/observations command"
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
    "exit-message": {
      "enabled": true,
      "features": [
        "print session title on app exit"
      ]
    },
    "startup-logo": {
      "enabled": true,
      "features": [
        "show N logo on fresh startup"
      ]
    },
    "sub-agents": {
      "enabled": true,
      "features": [
        "rpc child-process subagent execution",
        "custom context providers",
        "background result lookup and steering"
      ]
    },
    "sub-agent-status-widget": {
      "enabled": true,
      "features": [
        "custom subagent working widget",
        "live agent status lines",
        "replaces Pi default working loader"
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
    "term-modal": {
      "enabled": true,
      "features": [
        "persistent shell",
        "/term commands",
        "terminal shortcuts"
      ]
    },
    "todo": {
      "enabled": false,
      "features": [
        "todo modal",
        "ctrl+\\ shortcut"
      ]
    },
    "playground": {
      "enabled": false,
      "features": [
        "playground modal",
        "ctrl+i shortcut"
      ]
    },
    "workspace": {
      "enabled": false,
      "features": [
        "session switcher",
        "ctrl+; shortcut",
        "workspace top bar"
      ]
    }
  }
} satisfies FeatureFlagsConfig;
