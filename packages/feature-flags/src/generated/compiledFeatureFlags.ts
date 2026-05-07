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
      "category": "extension"
    },
    "exit-message": {
      "enabled": true,
      "features": [
        "print session title on app exit"
      ],
      "category": "extension"
    },
    "extension-manager": {
      "enabled": true,
      "features": [
        "/extensions command",
        "installed extension list",
        "core and user extension tabs",
        "per-user extension enable and disable controls"
      ],
      "category": "extension"
    },
    "websearch": {
      "enabled": true,
      "features": [
        "web_search tool backed by vendored pi-web-access",
        "code_search tool",
        "fetch_content tool",
        "get_search_content tool"
      ],
      "category": "extension"
    },
    "mcp-adapter": {
      "enabled": true,
      "features": [
        "MCP server adapter backed by vendored pi-mcp-adapter",
        "MCP slash commands",
        "MCP tool proxying"
      ],
      "category": "extension"
    },
    "rpiv-todo": {
      "enabled": true,
      "features": [
        "RPIV model todo tools backed by vendored @juicesharp/rpiv-todo",
        "live todo overlay"
      ],
      "category": "extension"
    },
    "rpiv-ask-user-question": {
      "enabled": true,
      "features": [
        "ask-user-question tool backed by vendored @juicesharp/rpiv-ask-user-question",
        "typed option prompts"
      ],
      "category": "extension"
    },
    "pi-lens": {
      "enabled": false,
      "features": [
        "code feedback backed by vendored pi-lens",
        "LSP and linter feedback",
        "structural analysis"
      ],
      "category": "extension"
    },
    "pi-queue": {
      "enabled": false,
      "features": [
        "FIFO queue backed by vendored @dhruv2mars/pi-queue",
        "queue/steer mode toggle",
        "queued message status"
      ],
      "category": "extension"
    },
    "oh-my-pi-lsp": {
      "enabled": true,
      "features": [
        "in-house LSP tool ported from Oh My Pi",
        "diagnostics, hover, definitions, references, symbols, rename previews, and code actions",
        "40-language server config registry with project-local binary discovery"
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
    "impeccable": {
      "enabled": false,
      "features": [
        "/impeccable command",
        "/impeccable live - Interactive visual variant mode",
        "/impeccable craft - Shape then build end-to-end",
        "/impeccable critique - UX design review",
        "/impeccable polish - Final quality pass"
      ],
      "category": "extension"
    },
    "md-editor": {
      "enabled": true,
      "features": [
        "/editor command",
        "demo.md Markdown line modal",
        "hidden persistent per-line chats",
        "live reload with diff acceptance",
        "Tron-styled right-panel mini chat"
      ],
      "category": "mini-app"
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
    "memory": {
      "enabled": true,
      "features": [
        "/memory two-pane browser",
        "tweet capture through Jina Reader",
        "memory project discovery before writes",
        "git-backed operation commits",
        "topic-first memory query tool",
        "Projects-compatible markdown memory storage"
      ],
      "category": "mini-app"
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
      "category": "extension"
    },
    "prompts": {
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
      "category": "extension"
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
    "telemetry": {
      "enabled": false,
      "features": [
        "SigNoz OTLP telemetry",
        "PostHog product analytics",
        "anonymous event toggles"
      ],
      "category": "extension"
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
