import type { AssistantMessage } from "@mariozechner/pi-ai";
import { CustomEditor, type ExtensionAPI, type ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem, AutocompleteProvider } from "@mariozechner/pi-tui";
import { Key, Text, matchesKey, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { TwoPaneSelectModal, sanitizePlainText } from "../shared/two-pane-select-modal/index.js";
import { getAgentDirPath } from "../../runtime/config/getAgentDirPath.js";
import { getProjectSettingsPath } from "../../runtime/config/getProjectSettingsPath.js";
import { logExtensionEvent } from "../shared/observability/startup-debug.ts";
import { getUsageTextForModel, refreshUsageForContext, subscribeUsageSnapshots } from "pi-slash-usage";
import { readEditorTriggerConfig } from "./editor-triggers/readEditorTriggerConfig.js";
import { findMatchingTrigger } from "./editor-triggers/findMatchingTrigger.js";
import { readNeoConfig } from "./readNeoConfig.js";
import { renderBottomBorderLabel } from "./ui/renderBottomBorderLabel.js";
import { renderUsageText } from "./ui/renderUsageText.js";

type GitState = {
  branch: string | null;
  dirtyCount: number;
  ahead: number;
  behind: number;
  isRepo: boolean;
};

const DEFAULT_GIT_STATE: GitState = {
  branch: null,
  dirtyCount: 0,
  ahead: 0,
  behind: 0,
  isRepo: false,
};

let gitState: GitState = { ...DEFAULT_GIT_STATE };
let gitRefreshInFlight: Promise<void> | null = null;
let requestPromptlineRender: (() => void) | undefined;
let promptlineInstalledForSession: string | null = null;
let usageRenderUnsubscribe: (() => void) | undefined;
let transportPreference = "sse";

const PRIMARY_COLOR = "error";
const SECONDARY_COLOR = "teal";
const CONTEXT_FG = "\x1b[38;2;190;190;190m";
const SECONDARY_COLOR_FG = "\x1b[38;2;125;214;198m";
const CONTEXT_OK_FG = SECONDARY_COLOR_FG;
const CONTEXT_WARN_FG = "\x1b[38;2;230;170;80m";
const CONTEXT_DANGER_FG = "\x1b[38;2;210;90;90m";
const RESET = "\x1b[0m";
const RAINBOW_COLORS: [number, number, number][] = [
  [233, 137, 115],
  [228, 186, 103],
  [141, 192, 122],
  [102, 194, 179],
  [121, 157, 207],
  [157, 134, 195],
  [206, 130, 172],
];

function brighten(rgb: [number, number, number], factor: number): string {
  const [r, g, b] = rgb.map((c) => Math.round(c + (255 - c) * factor));
  return `\x1b[38;2;${r};${g};${b}m`;
}

function rainbowText(text: string, frame: number): string {
  return (
    [...text]
      .map((char, index) => {
        const baseColor = RAINBOW_COLORS[index % RAINBOW_COLORS.length]!;
        const shinePos = frame % Math.max(1, text.length + 6);
        const dist = Math.abs(index - shinePos);
        const factor = dist === 0 ? 0.7 : dist === 1 ? 0.35 : 0;
        return `${brighten(baseColor, factor)}${char}`;
      })
      .join("") + RESET
  );
}

function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return `${Math.round(value)}`;
}

function formatCost(cost: number): string {
  if (!Number.isFinite(cost) || cost <= 0) return "$0.000";
  if (cost < 0.01) return `$${cost.toFixed(3)}`;
  if (cost < 1) return `$${cost.toFixed(2)}`;
  return `$${cost.toFixed(2)}`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0.0%";
  if (value < 10) return `${value.toFixed(1)}%`;
  return `${Math.round(value)}%`;
}

function stripProviderPrefix(modelId: string): string {
  return modelId.replace(/^[^/]+\//, "");
}

function parseBranchAb(line: string): { ahead: number; behind: number } {
  const match = line.match(/\+(-?\d+)\s+-(\d+)/);
  return {
    ahead: match ? Number.parseInt(match[1] ?? "0", 10) : 0,
    behind: match ? Number.parseInt(match[2] ?? "0", 10) : 0,
  };
}

async function readJson(path: string): Promise<any | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return undefined;
  }
}

async function refreshTransportPreference(cwd: string): Promise<void> {
  const globalSettings = await readJson(join(getAgentDirPath(), "settings.json"));
  const projectSettings = await readJson(getProjectSettingsPath(cwd));
  transportPreference = projectSettings?.transport ?? globalSettings?.transport ?? "sse";
}

async function refreshGitState(exec: ExtensionAPI["exec"]): Promise<void> {
  if (gitRefreshInFlight) return gitRefreshInFlight;

  gitRefreshInFlight = (async () => {
    try {
      const result = await exec("git", ["status", "--porcelain=v2", "--branch"], {
        timeout: 5000,
      });
      if (!result || result.code !== 0) {
        gitState = { ...DEFAULT_GIT_STATE };
        return;
      }

      let branch: string | null = null;
      let dirtyCount = 0;
      let ahead = 0;
      let behind = 0;

      for (const line of result.stdout.split(/\r?\n/)) {
        if (line.startsWith("# branch.head ")) {
          const head = line.slice("# branch.head ".length).trim();
          branch = head === "(detached)" ? "detached" : head;
          continue;
        }
        if (line.startsWith("# branch.ab ")) {
          const counts = parseBranchAb(line);
          ahead = counts.ahead;
          behind = counts.behind;
          continue;
        }
        if (line.startsWith("1 ") || line.startsWith("2 ") || line.startsWith("u ") || line.startsWith("? ")) {
          dirtyCount++;
        }
      }

      gitState = {
        branch,
        dirtyCount,
        ahead,
        behind,
        isRepo: true,
      };
    } catch {
      gitState = { ...DEFAULT_GIT_STATE };
    } finally {
      gitRefreshInFlight = null;
    }
  })();

  return gitRefreshInFlight;
}

function collectUsage(ctx: ExtensionContext): { totalTokens: number; cost: number } {
  let totalTokens = 0;
  let cost = 0;

  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "message" || entry.message.role !== "assistant") continue;
    const message = entry.message as AssistantMessage;
    totalTokens += (message.usage?.input ?? 0) + (message.usage?.output ?? 0);
    cost += message.usage?.cost?.total ?? 0;
  }

  return { totalTokens, cost };
}

function getContextColor(percent: number | undefined | null): string {
  if (typeof percent !== "number" || !Number.isFinite(percent)) return CONTEXT_FG;
  if (percent >= 66.67) return CONTEXT_DANGER_FG;
  if (percent >= 33.33) return CONTEXT_WARN_FG;
  return CONTEXT_OK_FG;
}

/**
 * Builds a five-cell context meter from the current usage percentage.
 *
 * @param percent Current context usage percentage.
 * @returns Context meter string.
 */
function buildContextBar(percent: number | undefined | null): string {
  const normalizedPercent = typeof percent === "number" && Number.isFinite(percent)
    ? Math.min(100, Math.max(0, percent))
    : 0;
  const filledCells = Math.max(0, Math.min(5, Math.round((normalizedPercent / 100) * 5)));
  return `${"▰".repeat(filledCells)}${"▱".repeat(5 - filledCells)}`;
}

/**
 * Formats context token usage while preserving the requested `0k/272k`-style output.
 *
 * @param currentTokens Tokens currently used in the context window.
 * @param contextWindow Total available context window.
 * @returns Formatted token usage.
 */
function formatContextTokenUsage(currentTokens: number, contextWindow: number): string {
  if (contextWindow <= 0) return formatCompact(currentTokens);
  if (contextWindow >= 1_000) {
    const currentInThousands = Math.floor(Math.max(0, currentTokens) / 1_000);
    const currentLabel = currentInThousands > 0 ? `${currentInThousands}k` : "0k";
    return `${currentLabel}/${formatCompact(contextWindow)}`;
  }
  return `${formatCompact(currentTokens)}/${formatCompact(contextWindow)}`;
}

function buildPromptline(
  ctx: ExtensionContext,
  uiTheme: ExtensionContext["ui"]["theme"],
  getThinkingLevel: ExtensionAPI["getThinkingLevel"],
  width?: number,
): { left: string; right: string } {
  const usage = ctx.getContextUsage();
  const currentModel = ctx.model;
  const modelId = stripProviderPrefix(currentModel?.id ?? "no-model");
  const thinking = getThinkingLevel();
  const branch = gitState.branch;

  const separator = uiTheme.fg("dim", " › ");
  const segments: string[] = [];
  const badgeFg = "\x1b[38;2;255;255;255m";
  const modelBadgeBg = "\x1b[48;2;180;45;45m";
  const thinkingBadgeBg = "\x1b[48;2;214;86;86m";
  const badge = (text: string, bg: string) => `${bg}${badgeFg} ${text} ${RESET}`;
  const maxPathWidth = Math.max(12, Math.floor((width ?? 80) * 0.8));
  const home = homedir();
  const displayCwd = ctx.cwd.startsWith(home) ? `~${ctx.cwd.slice(home.length)}` : ctx.cwd;
  const truncateFromStart = (text: string, maxWidth: number, ellipsis: string) => {
    if (visibleWidth(text) <= maxWidth) return text;
    const chars = [...text];
    let result = "";
    for (let i = chars.length - 1; i >= 0; i--) {
      const candidate = chars[i] + result;
      if (visibleWidth(ellipsis + candidate) > maxWidth) break;
      result = candidate;
    }
    return ellipsis + result;
  };
  const folderIcon = uiTheme.fg(PRIMARY_COLOR as any, "");
  const locationPath = truncateFromStart(displayCwd, Math.max(1, maxPathWidth - 2), "…");
  const location = `${folderIcon} ${uiTheme.fg(PRIMARY_COLOR as any, locationPath)}`;

  segments.push(location);

  if (branch) {
    let branchSegment = uiTheme.fg("syntaxFunction", branch);
    if (gitState.dirtyCount > 0) branchSegment += uiTheme.fg("warning", ` ✱${gitState.dirtyCount}`);
    if (gitState.ahead > 0 || gitState.behind > 0) {
      const arrows: string[] = [];
      if (gitState.ahead > 0) arrows.push(`↑${gitState.ahead}`);
      if (gitState.behind > 0) arrows.push(`↓${gitState.behind}`);
      branchSegment += uiTheme.fg("muted", ` ${arrows.join(" ")} `);
    }
    segments.push(branchSegment);
  }

  const contextWindow = usage?.contextWindow ?? currentModel?.contextWindow ?? 0;
  const currentContextTokens =
    typeof usage?.tokens === "number"
      ? usage.tokens
      : typeof usage?.percent === "number" && contextWindow > 0
        ? Math.round((usage.percent / 100) * contextWindow)
        : 0;
  const tokenUsage = formatContextTokenUsage(currentContextTokens, contextWindow);
  const contextBar = buildContextBar(usage?.percent);
  const contextColor = getContextColor(usage?.percent);

  return {
    left: segments.flatMap((segment, index) => (index === 0 ? [segment] : [separator, segment])).join(""),
    right: ` ${contextColor} ${contextBar} ${tokenUsage}${RESET}`,
  };
}

function renderPromptlineBorder(
  borderColor: (text: string) => string,
  uiTheme: ExtensionContext["ui"]["theme"],
  width: number,
  promptline: { left: string; right: string },
): string {
  if (width <= 0) return "";

  const leftPrefix = "─ ";
  const rightSuffix = " ─";
  const rightContent = promptline.right;
  const reservedWidth = visibleWidth(leftPrefix) + visibleWidth(rightSuffix) + visibleWidth(rightContent);
  const maxLeftWidth = Math.max(1, width - reservedWidth);
  const leftContent = truncateToWidth(promptline.left, maxLeftWidth, uiTheme.fg("dim", "…"));
  const fillerWidth = Math.max(
    0,
    width - visibleWidth(leftPrefix) - visibleWidth(leftContent) - visibleWidth(rightContent) - visibleWidth(rightSuffix),
  );
  return (
    borderColor(leftPrefix) +
    leftContent +
    borderColor("─".repeat(fillerWidth)) +
    rightContent +
    borderColor(rightSuffix)
  );
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function isEditorBorderLine(line: string): boolean {
  const stripped = stripAnsi(line).trim();
  return /^─+(?:\s[↑↓].*)?$/.test(stripped);
}

function extractEditorContentLines(lines: string[]): string[] {
  const result: string[] = [];
  let seenTop = false;
  for (const line of lines) {
    if (isEditorBorderLine(line)) {
      if (!seenTop) {
        seenTop = true;
        continue;
      }
      break;
    }
    if (seenTop) result.push(line);
  }
  return result;
}

function padToWidth(line: string, width: number): string {
  const truncated = truncateToWidth(line, width, "");
  return truncated + " ".repeat(Math.max(0, width - visibleWidth(truncated)));
}

function prefixEditorLine(
  line: string,
  width: number,
  prefix: string,
  colorize: (text: string) => string,
): string {
  const leadingSpacesMatch = line.match(/^ */);
  const leadingSpaces = leadingSpacesMatch?.[0] ?? "";
  const rest = line.slice(leadingSpaces.length);
  const coloredPrefix = colorize(prefix);
  const available = Math.max(0, width - visibleWidth(leadingSpaces) - visibleWidth(prefix));
  const content = truncateToWidth(rest, available, "");
  return padToWidth(leadingSpaces + coloredPrefix + content, width);
}

class AtModal extends TwoPaneSelectModal {
  private items: AutocompleteItem[] = [];

  constructor(
    private readonly cwd: string,
    private readonly uiTheme: ExtensionContext["ui"]["theme"],
    onPick: (item: AutocompleteItem) => void,
    onClose: () => void,
    requestRender: () => void,
  ) {
    super(uiTheme, onPick, onClose, undefined, {
      leftTitle: "Results",
      rightTitle: "Preview",
      bottomTitle: "Find Files",
      bottomPrefix: "> @",
    });

    this.setOnSelectionChange((item) => {
      void this.updatePreview(item, requestRender);
    });
  }

  setItems(items: AutocompleteItem[]) {
    this.items = items;
    super.setItems(items);
  }

  setQuery(query: string) {
    this.setBottom("Find Files", query, "> @");
  }

  setMode(_mode: "file") {}

  private async updatePreview(item: AutocompleteItem | null, requestRender: () => void) {
    if (!item?.value) {
      this.setRightLines([this.uiTheme.fg("dim", "No preview")]);
      requestRender();
      return;
    }

    const path = resolve(this.cwd, item.value.replace(/^@/, ""));
    try {
      const content = readFileSync(path, "utf8");
      const rawLines = content.split("\n").slice(0, 16);
      const previewLines = rawLines.map((line) => this.uiTheme.fg("muted", sanitizePlainText(line)));
      if (content.split("\n").length > 16) previewLines.push(this.uiTheme.fg("dim", "…"));
      this.setRightLines(previewLines);
    } catch {
      this.setRightLines([this.uiTheme.fg("dim", item.value), this.uiTheme.fg("warning", "Preview unavailable")]);
    }
    requestRender();
  }
}

class PromptlineEditor extends CustomEditor {
  private autocompleteProvider?: AutocompleteProvider;
  private rainbowTimer?: ReturnType<typeof setInterval>;
  private rainbowFrame = 0;
  private atModal?: AtModal;
  private atModalHandle?: { hide: () => void; focus: () => void; isFocused: () => boolean };
  private autocompleteAbort?: AbortController;
  private autocompletePrefix = "";
  private autocompleteMode: "file" = "file";
  private triggerSubmitInFlight = false;

  constructor(
    tui: any,
    theme: any,
    keybindings: any,
    private readonly ctx: ExtensionContext,
    private readonly uiTheme: ExtensionContext["ui"]["theme"],
    private readonly getThinkingLevel: ExtensionAPI["getThinkingLevel"],
    private readonly getSessionName: ExtensionAPI["getSessionName"],
  ) {
    super(tui, theme, keybindings);
  }

  setAutocompleteProvider(provider: AutocompleteProvider): void {
    this.autocompleteProvider = provider;
  }

  private hasAutocompleteTrigger(): boolean {
    const cursor = this.getCursor();
    const line = this.getLines()[cursor.line] ?? "";
    const textBeforeCursor = line.slice(0, cursor.col);
    return /(?:^|\s)@(?:"[^"]*|[^\s]*)$/.test(textBeforeCursor);
  }

  private isSlashContext(): boolean {
    const cursor = this.getCursor();
    const line = this.getLines()[cursor.line] ?? "";
    const textBeforeCursor = line.slice(0, cursor.col);
    return textBeforeCursor.startsWith("/");
  }

  private syncRainbow(): void {
    if (this.hasAutocompleteTrigger()) {
      if (this.rainbowTimer) return;
      this.rainbowTimer = setInterval(() => {
        this.rainbowFrame++;
        this.tui.requestRender();
      }, 60);
      return;
    }
    if (this.rainbowTimer) {
      clearInterval(this.rainbowTimer);
      this.rainbowTimer = undefined;
    }
  }

  private closeAtModal(): void {
    this.atModalHandle?.hide();
    this.atModalHandle = undefined;
    this.atModal = undefined;
    this.autocompleteAbort?.abort();
    this.autocompleteAbort = undefined;
    this.tui.requestRender();
  }

  private applyAutocompleteItem(item: AutocompleteItem): void {
    if (!this.autocompleteProvider) return;
    const cursor = this.getCursor();
    const result = this.autocompleteProvider.applyCompletion(this.getLines(), cursor.line, cursor.col, item, this.autocompletePrefix);
    (this as any).state.lines = result.lines;
    (this as any).state.cursorLine = result.cursorLine;
    (this as any).setCursorCol(result.cursorCol);
    this.syncRainbow();
    void this.refreshAtModal();
  }

  private async refreshAtModal(): Promise<void> {
    if (!this.autocompleteProvider || !this.hasAutocompleteTrigger()) {
      this.closeAtModal();
      return;
    }

    if (!this.atModal) {
      this.atModal = new AtModal(
        this.ctx.cwd,
        this.uiTheme,
        (item) => this.applyAutocompleteItem(item),
        () => this.closeAtModal(),
        () => this.tui.requestRender(),
      );
      this.atModalHandle = this.tui.showOverlay(this.atModal, {
        anchor: "center",
        width: "80%",
        minWidth: 80,
        maxHeight: "85%",
        nonCapturing: true,
      });
      this.tui.requestRender();
    }

    this.autocompleteAbort?.abort();
    const controller = new AbortController();
    this.autocompleteAbort = controller;
    try {
      const cursor = this.getCursor();
      const lines = this.getLines();
      const suggestions = await this.autocompleteProvider.getSuggestions(lines, cursor.line, cursor.col, { signal: controller.signal, force: false });
      if (controller.signal.aborted) return;
      if (!this.atModal || !suggestions) {
        this.closeAtModal();
        return;
      }
      const prefix = suggestions.prefix ?? "";
      if (!prefix.startsWith("@")) {
        this.closeAtModal();
        return;
      }
      this.autocompleteMode = "file";
      this.autocompletePrefix = prefix;
      this.atModal.setMode("file");
      this.atModal.setQuery(prefix.replace(/^@/, ""));
      this.atModal.setItems(suggestions.items ?? []);
      this.tui.requestRender();
    } catch {
      // ignore autocomplete fetch failures
    }
  }

  /**
   * Checks the shared trigger config and auto-submits matching editor text.
   *
   * @param text Current editor text snapshot.
   */
  private async handleConfiguredTriggers(text: string): Promise<void> {
    if (!text.trim() || this.triggerSubmitInFlight) return;
    const [triggerConfig, neoConfig] = await Promise.all([
      readEditorTriggerConfig(this.ctx.cwd),
      readNeoConfig(this.ctx.cwd),
    ]);
    const match = findMatchingTrigger(triggerConfig, text);
    if (!match || match.action.type !== "submit") return;
    if (this.getText() !== text) return;
    if (!this.onSubmit) return;
    this.triggerSubmitInFlight = true;
    try {
      // This route simulates submit for editor-triggered commands.
      // Clearing is configurable because direct `onSubmit()` bypasses the editor's native reset path.
      if (neoConfig.clearEditorOnTriggerSubmit) {
        super.setText("");
      }
      await Promise.resolve((this.onSubmit as (value: string) => unknown)(text));
    } finally {
      this.triggerSubmitInFlight = false;
    }
  }

  override setText(text: string): void {
    super.setText(text);
    // Pi overwrites custom editor `onChange`, so trigger checks must live here.
    void this.handleConfiguredTriggers(this.getText());
  }

  override handleInput(data: string): void {
    if (this.atModal && (matchesKey(data, Key.up) || matchesKey(data, Key.down) || matchesKey(data, Key.enter))) {
      this.atModal.handleInput(data);
      this.tui.requestRender();
      return;
    }
    if (this.atModal && matchesKey(data, Key.escape)) {
      this.closeAtModal();
      return;
    }
    if (matchesKey(data, "ctrl+r")) {
      this.closeAtModal();
      this.setText("/reload");
      this.tui.requestRender();
      return;
    }

    super.handleInput(data);
    this.syncRainbow();
    void this.refreshAtModal();
    // Keep trigger checks in `handleInput` too so typed shortcuts still auto-submit.
    void this.handleConfiguredTriggers(this.getText());
  }

  render(width: number): string[] {
    if (this.isSlashContext() && !this.atModal) {
      this.borderColor = (text: string) => this.uiTheme.fg(PRIMARY_COLOR as any, text);
      return super.render(width);
    }

    this.borderColor = (text: string) => this.uiTheme.fg(PRIMARY_COLOR as any, text);
    if (this.getPaddingX() !== 1) this.setPaddingX(1);
    const innerWidth = Math.max(1, width - 2);
    const baseLines = super.render(innerWidth);
    if (baseLines.length === 0) return baseLines;
    const editorContent = extractEditorContentLines(baseLines);

    const top =
      this.borderColor("╭") +
      renderPromptlineBorder(
        this.borderColor,
        this.uiTheme,
        innerWidth,
        buildPromptline(this.ctx, this.uiTheme, this.getThinkingLevel, innerWidth),
      ) +
      this.borderColor("╮");
    const bottom =
      this.borderColor("╰") +
      renderBottomBorderLabel(
        this.borderColor,
        this.uiTheme,
        innerWidth,
        renderUsageText(this.uiTheme, getUsageTextForModel(this.ctx.model)),
      ) +
      this.borderColor("╯");
    const contentLines = editorContent.map((line) => padToWidth(line, innerWidth));
    if (contentLines.length > 0) {
      contentLines[0] = prefixEditorLine(contentLines[0]!.replace(/^\s+/, ""), innerWidth, "» ", (text) => this.uiTheme.fg(PRIMARY_COLOR as any, text));
    }
    const middle = contentLines.map((line) => this.borderColor("│") + padToWidth(line, innerWidth) + this.borderColor("│"));

    const lines = [top, ...middle, bottom];
    for (const [index, line] of lines.entries()) {
      const renderedWidth = visibleWidth(line);
      if (renderedWidth > width) {
        logExtensionEvent("neo-editor", "overflow", {
          width,
          lineIndex: index,
          renderedWidth,
        });
      }
    }
    return lines;
  }
}

function installPromptline(
  ctx: ExtensionContext,
  deps: { exec: ExtensionAPI["exec"]; getThinkingLevel: ExtensionAPI["getThinkingLevel"]; getSessionName: ExtensionAPI["getSessionName"] },
): void {
  ctx.ui.setFooter(() => ({
    dispose() { },
    invalidate() { },
    render(): string[] {
      return [];
    },
  }));

  ctx.ui.setEditorComponent((tui, theme, keybindings) => {
    requestPromptlineRender = () => tui.requestRender();
    usageRenderUnsubscribe?.();
    usageRenderUnsubscribe = subscribeUsageSnapshots(() => tui.requestRender());
    void refreshGitState(deps.exec).then(() => tui.requestRender());
    void refreshTransportPreference(ctx.cwd).then(() => tui.requestRender());
    return new PromptlineEditor(tui, theme, keybindings, ctx, ctx.ui.theme, deps.getThinkingLevel, deps.getSessionName);
  });
}

function ensurePromptlineInstalled(
  ctx: ExtensionContext,
  deps: { exec: ExtensionAPI["exec"]; getThinkingLevel: ExtensionAPI["getThinkingLevel"]; getSessionName: ExtensionAPI["getSessionName"] },
): void {
  const sessionFile = ctx.sessionManager.getSessionFile() ?? "__ephemeral__";
  if (promptlineInstalledForSession === sessionFile) return;
  promptlineInstalledForSession = sessionFile;
  logExtensionEvent("neo-editor", "ensurePromptlineInstalled", {
    sessionFile: ctx.sessionManager.getSessionFile() ?? null,
  });
  installPromptline(ctx, deps);
}

async function refreshAndRender(
  ctx: ExtensionContext,
  deps: { exec: ExtensionAPI["exec"]; getThinkingLevel?: ExtensionAPI["getThinkingLevel"]; getSessionName?: ExtensionAPI["getSessionName"] },
): Promise<void> {
  logExtensionEvent("neo-editor", "refreshAndRender:start", {
    sessionFile: ctx.sessionManager.getSessionFile() ?? null,
  });
  await Promise.all([refreshGitState(deps.exec), refreshTransportPreference(ctx.cwd), refreshUsageForContext(ctx, true)]);
  requestPromptlineRender?.();
  logExtensionEvent("neo-editor", "refreshAndRender:done", {
    sessionFile: ctx.sessionManager.getSessionFile() ?? null,
  });
}

export default function(pi: ExtensionAPI) {
  logExtensionEvent("neo-editor", "init");
  const deps = {
    exec: pi.exec,
    getThinkingLevel: pi.getThinkingLevel.bind(pi),
    getSessionName: pi.getSessionName.bind(pi),
  };

  pi.on("session_start", async (event, ctx) => {
    logExtensionEvent("neo-editor", "session_start", {
      reason: event.reason,
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    ensurePromptlineInstalled(ctx, deps);
    logExtensionEvent("neo-editor", "session_start:afterEnsure", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
    await refreshAndRender(ctx, deps);
    logExtensionEvent("neo-editor", "session_start:done", {
      sessionFile: ctx.sessionManager.getSessionFile() ?? null,
    });
  });

  pi.on("turn_end", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("model_select", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("session_tree", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("session_compact", async (_event, ctx) => {
    await refreshAndRender(ctx, deps);
  });

  pi.on("session_shutdown", async () => {
    requestPromptlineRender = undefined;
    promptlineInstalledForSession = null;
    usageRenderUnsubscribe?.();
    usageRenderUnsubscribe = undefined;
  });

}
