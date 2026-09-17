import type { ExtensionUIContext } from "@earendil-works/pi-coding-agent";
import { isKeyRelease, matchesKey, type KeyId, type SettingItem, type TUI, truncateToWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { handleModalScrollInput } from "@nexus/tui-kit/modal/scroll/handleModalScrollInput.js";
import { SharedModal } from "@nexus/tui-kit/modal/SharedModal.js";
import type { SharedModalPane } from "@nexus/tui-kit/modal/types.js";
import type { Theme } from "./agent-widget.js";

export interface DialogKeybindings {
  matches(data: string, id: any): boolean;
  getKeys?(id: any): readonly string[];
}
export function dialogKey(data: string, kb: DialogKeybindings | undefined, id: string, fallback: KeyId): boolean {
  return kb ? kb.matches(data, id) : matchesKey(data, fallback);
}
export function keyLabel(kb: DialogKeybindings | undefined, id: string, fallback: string): string {
  return kb?.getKeys?.(id)?.join("/") ?? fallback;
}
/** Translate configured selection controls for the shared shell's canonical keys. */
export function navigationInput(data: string, kb?: DialogKeybindings): string {
  // Nexus distinguishes close-all (Ctrl+C) from preview-back (Escape), even
  // though Pi's default cancel action includes both.
  if (matchesKey(data, "ctrl+c")) return data;
  for (const [id, canonical] of [
    ["up", "\x1b[A"], ["down", "\x1b[B"], ["pageUp", "\x1b[5~"],
    ["pageDown", "\x1b[6~"], ["confirm", "\r"], ["cancel", "\x1b"],
  ]) if (kb?.matches(data, `tui.select.${id}`)) return canonical;
  return data;
}
/** Nexus gg/G and half-page state, with configured keys normalized by callers. */
export class DialogNavigation {
  private pending = false;
  reset(): void { this.pending = false; }
  move(data: string, offset: number, max: number, rows: number, wrap = false): number | undefined {
    if (isKeyRelease(data)) return undefined;
    const down = matchesKey(data, "down") || matchesKey(data, "ctrl+n") || data === "j";
    const up = matchesKey(data, "up") || matchesKey(data, "ctrl+p") || data === "k";
    const result = handleModalScrollInput({ data: down ? "j" : up ? "k" : data,
      pendingGotoStart: this.pending, scrollOffset: offset, maxScrollOffset: Math.max(0, max), visibleRows: rows });
    this.pending = result.pendingGotoStart;
    if (wrap && (up || down) && max >= 0) return (offset + (down ? 1 : -1) + max + 1) % (max + 1);
    if (result.handled) return result.scrollOffset;
    if (matchesKey(data, "home")) return 0;
    if (matchesKey(data, "end")) return Math.max(0, max);
    if (matchesKey(data, "pageUp")) return Math.max(0, offset - rows);
    if (matchesKey(data, "pageDown")) return Math.min(Math.max(0, max), offset + rows);
    return undefined;
  }
}
export const dialogRows = (tui: Pick<TUI, "terminal">): number => Math.max(1, Math.floor(tui.terminal.rows * .7));

/** Domain views own their state and scrolling; SharedModal owns only the chrome. */
export class AgentDialogFrame extends SharedModal {
  update(header: string[], panes: SharedModalPane[], footer: string[], rows: number): void {
    this.headerLines = header;
    this.panes = panes;
    this.footerLines = footer;
    this.setWidthPolicy(1, undefined, 1, true, rows);
  }
}
export function createDialogFrame(theme: Theme): AgentDialogFrame {
  return new AgentDialogFrame({ theme, panes: [], fullScreenHotkey: false, overflowScrollbar: false });
}

export class AgentSelectDialog extends AgentDialogFrame {
  private navigation = new DialogNavigation();
  private selected = 0;
  private preview = false;
  private offset = 0;
  private page = 8;
  private details: string[];
  private heading: string;
  constructor(theme: Theme, title: string, private labels: readonly string[], private kb: DialogKeybindings | undefined, private finish: (value: string | undefined) => void, private rows = () => 24) {
    super({ theme, panes: [], fullScreenHotkey: false, overflowScrollbar: false });
    [this.heading, ...this.details] = title.split("\n");
  }
  override handleInput(data: string): void {
    if (isKeyRelease(data)) return;
    data = navigationInput(data, this.kb);
    if (matchesKey(data, "escape") && this.preview) { this.preview = false; this.navigation.reset(); return; }
    if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) { this.finish(undefined); return; }
    if ((matchesKey(data, "tab") || matchesKey(data, "shift+tab")) && this.details.length) { this.preview = !this.preview; this.navigation.reset(); return; }
    if (matchesKey(data, "enter") && !this.preview) { this.finish(this.labels[this.selected]); return; }
    const value = this.navigation.move(data, this.preview ? this.offset : this.selected,
      this.preview ? this.details.length - this.page : this.labels.length - 1, this.page, !this.preview);
    if (value !== undefined) {
      if (this.preview) this.offset = value;
      else this.selected = value;
    }
  }
  override render(width: number): string[] {
    const rows = this.rows();
    this.page = Math.max(1, rows - 7);
    const start = Math.max(0, this.selected - this.page + 1);
    const list = this.labels.slice(start, start + this.page).map((label, i) => `${start + i === this.selected ? "❯" : " "} ${label}`);
    const panes = [{ id: "options", size: 1, lines: list }];
    if (this.details.length) panes.push({ id: "preview", size: 2, lines: this.details.slice(this.offset, this.offset + this.page) });
    this.update([`${this.preview ? "○" : "●"} ${this.heading}${this.details.length ? ` · ${this.preview ? "●" : "○"} Details` : ""}`], panes,
      [`${keyLabel(this.kb, "tui.select.up", "↑")}/${keyLabel(this.kb, "tui.select.down", "↓")} select · ${keyLabel(this.kb, "tui.select.confirm", "enter")} open · ${keyLabel(this.kb, "tui.select.cancel", "esc")} close${this.details.length ? " · Tab pane" : ""}`], rows);
    return super.render(width).map(line => truncateToWidth(line, width));
  }
}

/** Settings retain their domain values/callbacks, with selection and preview owned here. */
export class AgentSettingsDialog extends AgentDialogFrame {
  private navigation = new DialogNavigation();
  private selected = 0;
  private preview = false;
  private offset = 0;
  private maxOffset = 0;
  constructor(private tui: TUI, theme: Theme, private title: string, private items: SettingItem[], private kb: DialogKeybindings, private change: (id: string, value: string) => void, private close: () => void, private numeric?: (id: string) => boolean, private hints: string[] = []) {
    super({ theme, panes: [], fullScreenHotkey: false, overflowScrollbar: false });
  }
  /** Refresh derived labels/values without remounting or moving pane focus. */
  setItems(items: SettingItem[]): void {
    const selectedId = this.items[this.selected]?.id;
    this.items = items;
    const selected = items.findIndex(item => item.id === selectedId);
    this.selected = selected >= 0 ? selected : Math.max(0, Math.min(this.selected, items.length - 1));
    this.tui.requestRender();
  }
  override handleInput(data: string): void {
    if (isKeyRelease(data)) return;
    data = navigationInput(data, this.kb);
    if (matchesKey(data, "escape") && this.preview) { this.preview = false; this.navigation.reset(); this.tui.requestRender(); return; }
    if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) { this.close(); return; }
    const count = this.items.length;
    if (!count) return;
    const page = Math.max(1, dialogRows(this.tui) - 8 - this.hints.length);
    if (matchesKey(data, "tab") || matchesKey(data, "shift+tab")) { this.preview = !this.preview; this.navigation.reset(); this.tui.requestRender(); return; }
    const next = this.navigation.move(data, this.preview ? this.offset : this.selected, this.preview ? this.maxOffset : count - 1, page, !this.preview);
    if (this.preview) {
      if (next !== undefined) this.offset = next;
      this.tui.requestRender(); return;
    }
    this.offset = 0;
    if (next !== undefined) this.selected = next;
    if (matchesKey(data, "enter") || data === " ") {
      const item = this.items[this.selected];
      if (this.numeric?.(item.id)) this.change(item.id, item.currentValue);
      else if (item.values?.length) {
        item.currentValue = item.values[(item.values.indexOf(item.currentValue) + 1) % item.values.length];
        this.change(item.id, item.currentValue);
      }
    }
    this.tui.requestRender();
  }
  override render(width: number): string[] {
    const rows = dialogRows(this.tui);
    const page = Math.max(1, rows - 8 - this.hints.length);
    const start = Math.max(0, this.selected - page + 1);
    const selected = this.items[this.selected];
    const description = wrapTextWithAnsi(selected?.description ?? "", Math.max(1, Math.floor((width - 3) / 3)));
    this.maxOffset = Math.max(0, description.length - page);
    this.update([`${this.preview ? "○" : "●"} ${this.title} · ${this.preview ? "●" : "○"} Description (Tab)`], [
      { id: "settings", size: 2, lines: this.items.slice(start, start + page).map((item, i) => `${start + i === this.selected ? "❯" : " "} ${item.label}: ${item.currentValue}`) },
      { id: "description", size: 1, lines: description.slice(this.offset, this.offset + page) },
    ], [...this.hints, `${keyLabel(this.kb, "tui.select.up", "↑")}/${keyLabel(this.kb, "tui.select.down", "↓")} select · ${keyLabel(this.kb, "tui.select.confirm", "enter")}/space change · ${keyLabel(this.kb, "tui.select.cancel", "esc")} close`], rows);
    return super.render(width).map(line => truncateToWidth(line, width));
  }
}

/** UI hosts with custom components use the Nexus select shell. */
export async function selectAgentOption(ui: Pick<ExtensionUIContext, "select"> & Partial<Pick<ExtensionUIContext, "custom">>, title: string, labels: string[]): Promise<string | undefined> {
  if (!ui.custom) return ui.select(title, labels);
  let mounted = false;
  const selected = await ui.custom<string | undefined>((tui, theme, kb, done) => {
    mounted = true;
    const dialog = new AgentSelectDialog(theme, title, labels, kb, done, () => dialogRows(tui));
    return { render: width => dialog.render(width), invalidate: () => dialog.invalidate(), handleInput: data => { dialog.handleInput(data); tui.requestRender(); } };
  }, { overlay: true, overlayOptions: { width: "90%", maxHeight: "70%" } });
  // RPC has a custom() no-op: retain the original remote select protocol there.
  return mounted ? selected : ui.select(title, labels);
}
