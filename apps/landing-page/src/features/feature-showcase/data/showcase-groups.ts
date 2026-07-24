import type { ShowcaseGroup } from "../types/showcase-feature";

/** Feature showcase groups derived from bundled Nexus capabilities. */
export const showcaseGroups: readonly ShowcaseGroup[] = [
  {
    id: "core-plugins",
    label: "Core plugins",
    eyebrow: "Core plugins",
    title: "Sharper coding tools ship inside Nexus.",
    body: "Nexus bundles repo-aware tools for search, language intelligence, shell rewrites, and external developer systems so agents can work without separate plugin installs.",
    examples: [
      {
        id: "code-lsp",
        eyebrow: "Oh My Pi LSP",
        title: "Symbol-aware code navigation",
        body: "The in-house LSP port exposes diagnostics, hover, definitions, references, symbols, rename previews, and code actions through the Nexus tool loop.",
        bullets: ["40-language server registry", "Project-local binary discovery", "Rename and code-action workflows"],
      },
      {
        id: "code-fast-files",
        eyebrow: "FFF + RTK",
        title: "Fast file and shell primitives",
        body: "FFF powers read, grep, and @ file autocomplete overrides while RTK adds native read, find, ls, grep, bash, and bash rewrite support.",
        bullets: ["Read and grep overrides", "Native project file tools", "Bash rewrite support"],
      },
      {
        id: "code-web-mcp",
        eyebrow: "Web fetch + MCP",
        title: "Research and tool gateways",
        body: "Native web fetch, web search, MCP slash commands, and MCP proxy tools keep external context reachable from the TUI.",
        bullets: ["web_fetch and web_search", "MCP command and proxy support"],
      },
    ],
  },
  {
    id: "custom-plugins",
    label: "Custom plugins",
    eyebrow: "Custom plugins",
    title: "Opinionated workflow plugins reduce terminal noise.",
    body: "Nexus customizes the promptline, usage surfaces, provider flows, observations, notifications, and the compact Tron interface around focused agent work.",
    examples: [
      {
        id: "custom-promptline",
        eyebrow: "Neo editor",
        title: "Promptline workflows stay visible",
        body: "The custom promptline handles slash usage, @ file autocomplete, editor-trigger submits, image paste fallback, and project-aware status details.",
        bullets: ["Slash and @ workflows", "Project, branch, and context status", "Editor trigger submits"],
      },
      {
        id: "custom-operator",
        eyebrow: "Operator layer",
        title: "Sessions report useful state",
        body: "Observations, cmux title sync, desktop notifications, exit messages, startup status, and feature management make long-running terminal work easier to operate.",
        bullets: ["Observation status widget", "cmux title and done sync", "Desktop completion notifications"],
      },
    ],
  },
  {
    id: "mini-apps",
    label: "Mini-apps",
    eyebrow: "Mini-apps",
    title: "Full-screen workflows live beside chat.",
    body: "Nexus mini-apps turn common agent-adjacent tasks into terminal-native modals, browsers, editors, dashboards, and focused side quests.",
    examples: [
      {
        id: "mini-tetris",
        eyebrow: "Tetris",
        title: "A production mini-app proves modal depth",
        body: "The Tetris mini-app ships as a full-screen keyboard-controlled modal with Escape hide, pause behavior, and shared session resume.",
        bullets: ["/tetris command", "Keyboard-controlled modal", "Paused shared session resume"],
      },
      {
        id: "mini-editor",
        eyebrow: "Markdown editor",
        title: "Documents can host hidden chats",
        body: "The Markdown editor provides a line modal, hidden per-line chats, live reload, diff acceptance, and a Tron-styled mini chat panel.",
        bullets: ["/editor command", "Per-line chats", "Live reload with diff acceptance"],
      },
      {
        id: "mini-manager",
        eyebrow: "Mini-app manager",
        title: "Mini-apps stay discoverable",
        body: "The mini-app manager lists installed mini-apps and exposes enable or disable controls, while bundled examples include Tetris.",
        bullets: ["/mini-apps command", "Installed mini-app list", "Enable and disable controls"],
      },
    ],
  },
];
