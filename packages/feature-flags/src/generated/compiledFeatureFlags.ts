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
      ],
      "category": "extension"
    },
    "automations": {
      "enabled": false,
      "features": [
        "/automations full-screen automation picker",
        "two-pane automation detail and agent chat editor",
        "live prompt and schedule update flow",
        "nexus automations CLI commands",
        "scheduled prompt automation daemon",
        "SQLite automation and run history storage",
        "bundled automation templates"
      ],
      "category": "mini-app"
    },
    "auto-update": {
      "enabled": true,
      "features": [
        "async startup npm version check",
        "Nexus update confirmation modal",
        "prompted npm install for approved updates"
      ],
      "category": "extension"
    },
    "cmux": {
      "enabled": true,
      "features": [
        "sync session title to cmux pane title",
        "notify cmux tab when pane is done",
        "/cmux workspace shell session view"
      ],
      "category": "pro"
    },
    "context-usage": {
      "enabled": true,
      "features": [
        "context_usage tool for current chat context window usage",
        "/context command for current chat context window usage"
      ],
      "category": "extension"
    },
    "chat-status": {
      "enabled": true,
      "features": [
        "write active chats to ~/.local/share/nexus/agent/chat-status.json",
        "remove chats when inference stops"
      ],
      "category": "extension"
    },
    "exit-message": {
      "enabled": true,
      "features": [
        "print session title on app exit"
      ],
      "category": "extension"
    },
    "pi-packages": {
      "enabled": true,
      "features": [
        "/pi-packages command",
        "third-party extension list",
        "npm package install/update/remove controls",
        "per-user extension enable and disable controls"
      ],
      "category": "extension"
    },
    "webtools": {
      "enabled": true,
      "features": [
        "web_search tool backed by SearXNG",
        "web_fetch tool backed by Nexus native web fetch",
        "code_search tool backed by GitHub repository search"
      ],
      "category": "extension"
    },
    "ask-user-question": {
      "enabled": true,
      "features": [
        "ask_user_question tool",
        "typed option prompts"
      ],
      "category": "extension"
    },
    "fff": {
      "enabled": true,
      "features": [
        "FFF-backed read override",
        "FFF-backed grep override",
        "FFF-powered @ file autocomplete"
      ],
      "category": "extension"
    },
    "neo-editor": {
      "enabled": true,
      "features": [
        "custom promptline",
        "slashusage",
        "@ file autocomplete",
        "editor trigger submit",
        "macOS ctrl+v image paste fallback"
      ],
      "category": "extension"
    },
    "prompt-queue": {
      "enabled": true,
      "features": [
        "persisted Neo editor prompt queue",
        "queue box above promptline",
        "queue navigation, edit, send, and delete hotkeys"
      ],
      "category": "extension"
    },
    "steer-queue": {
      "enabled": true,
      "features": [
        "nexus steer CLI command",
        "agent-dir per-session steering queue",
        "poll and deliver top-level session steering messages"
      ],
      "category": "extension"
    },
    "hotkeys": {
      "enabled": true,
      "features": [
        "/hotkeys and ? hotkey browser",
        "hotkey filtering",
        "hotkey editing and conflict approval"
      ],
      "category": "extension"
    },
    "slash-menu": {
      "enabled": true,
      "features": [
        "slash command menu opened with /",
        "command grouping and filtering",
        "internal model, login, resume, fork, and settings menus"
      ],
      "category": "extension"
    },
    "notify": {
      "enabled": true,
      "features": [
        "desktop notification on agent completion",
        "macOS submarine sound by default",
        "NEXUS_NOTIFY_SOUND_CMD override"
      ],
      "category": "extension"
    },
    "observations": {
      "enabled": true,
      "features": [
        "observation tracking",
        "status widget",
        "/observations command"
      ],
      "category": "pro"
    },
    "system-prompt": {
      "enabled": true,
      "features": [
        "/SystemPrompt prompt viewer",
        "system prompt editing",
        "system prompt reset to default"
      ],
      "category": "extension"
    },
    "rtk": {
      "enabled": true,
      "features": [
        "rtk rewrite for bash",
        "rtk-native read/find/ls/grep tools"
      ],
      "category": "pro"
    },
    "startup-hero": {
      "enabled": true,
      "features": [
        "show N logo, version, tips, and startup status"
      ],
      "category": "extension"
    },
    "tetris": {
      "enabled": true,
      "features": [
        "/tetris command",
        "full-screen keyboard-controlled Tetris modal",
        "Escape hide with paused shared session resume"
      ],
      "category": "mini-app"
    },
    "tron": {
      "enabled": true,
      "features": [
        "compact tool lines",
        "thinking style",
        "tool calls browser",
        "user message bubble"
      ],
      "category": "extension"
    },
    "slashusage": {
      "enabled": true,
      "features": [
        "inline slashusage",
        "5-minute historical usage snapshots",
        "/usage history graph modal"
      ],
      "category": "extension"
    }
  },
  "other": {
    "social-automation": {
      "enabled": true,
      "features": [
        "nexus social-automation CLI commands",
        "Nitter RSS ingestion",
        "YouTube RSS ingestion",
        "yt-dlp audio preparation"
      ],
      "category": "mini-app"
    },
    "mini-app-manager": {
      "enabled": true,
      "features": [
        "/mini-apps command",
        "installed mini-app list",
        "mini-app enable and disable controls"
      ],
      "category": "mini-app"
    }
  }
} satisfies FeatureFlagsConfig;
