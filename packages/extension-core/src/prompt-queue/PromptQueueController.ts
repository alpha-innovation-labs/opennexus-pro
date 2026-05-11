import { createPromptQueueItem } from "./createPromptQueueItem.js";
import { sanitizePromptQueueText } from "./sanitizePromptQueueText.js";
import type { PromptQueueItem } from "./types.js";

/** Coordinates in-memory prompt queue state for the Neo editor. */
export class PromptQueueController {
  private items: PromptQueueItem[] = [];
  private focused = false;
  private pendingDeleteKey = false;
  private pendingDispatchId: string | undefined;
  private selectedIndex = 0;
  private readonly onChange: (items: PromptQueueItem[]) => void;

  /**
   * Creates a prompt queue controller.
   *
   * @param onChange Persistence callback called after mutations.
   */
  constructor(onChange: (items: PromptQueueItem[]) => void = () => undefined) {
    this.onChange = onChange;
  }

  /**
   * Replaces the current queue from persisted storage.
   *
   * @param items Persisted queue items.
   */
  hydrate(items: PromptQueueItem[]): void {
    this.items = items.filter((item) => item.text.trim().length > 0);
    this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, this.items.length - 1));
    this.pendingDispatchId = undefined;
  }

  /** @returns Current queue snapshot. */
  getItems(): PromptQueueItem[] {
    return [...this.items];
  }

  /** @returns Currently selected queue item. */
  getSelected(): PromptQueueItem | undefined {
    return this.items[this.selectedIndex];
  }

  /** @returns Next queue item that will be dispatched automatically. */
  peekNext(): PromptQueueItem | undefined {
    return this.items[0];
  }

  /** Removes and returns the next queue item to dispatch. */
  dequeueNext(): PromptQueueItem | undefined {
    const next = this.peekNext();
    if (!next) return undefined;
    this.remove(next.id);
    return next;
  }

  /** Marks the first item as waiting for auto-dispatch. */
  beginPendingDispatch(): PromptQueueItem | undefined {
    const next = this.peekNext();
    this.pendingDispatchId = next?.id;
    return next;
  }

  /** Clears any pending auto-dispatch marker. */
  cancelPendingDispatch(): void {
    this.pendingDispatchId = undefined;
  }

  /** @returns True when one item is in the auto-dispatch grace period. */
  isDispatchPending(): boolean {
    return this.pendingDispatchId !== undefined;
  }

  /**
   * Checks whether an item is pending auto-dispatch.
   *
   * @param id Queue item id.
   * @returns True when the item is pending auto-dispatch.
   */
  isPendingDispatchItem(id: string): boolean {
    return this.pendingDispatchId === id;
  }

  /** @returns True when queue navigation owns input. */
  isFocused(): boolean {
    return this.focused;
  }

  /** Toggles queue navigation focus. */
  toggleFocus(): void {
    this.focused = !this.focused && this.items.length > 0;
  }

  /** Clears queue navigation focus. */
  blur(): void {
    this.focused = false;
  }

  /** @returns True when one delete-prefix key is pending. */
  hasPendingDeleteKey(): boolean {
    return this.pendingDeleteKey;
  }

  /** Sets whether one delete-prefix key is pending. */
  setPendingDeleteKey(value: boolean): void {
    this.pendingDeleteKey = value;
  }

  /** Moves the selected queue row by a signed delta. */
  move(delta: number): void {
    this.pendingDeleteKey = false;
    if (this.items.length === 0) return;
    this.selectedIndex = Math.max(0, Math.min(this.items.length - 1, this.selectedIndex + delta));
  }

  /** Adds non-empty text to the end of the queue. */
  enqueue(text: string): PromptQueueItem | undefined {
    const sanitized = sanitizePromptQueueText(text);
    if (!sanitized) return undefined;
    const item = createPromptQueueItem(sanitized);
    this.items = [...this.items, item];
    this.persist();
    return item;
  }

  /** Replaces one queue item text, or removes it when new text is empty. */
  update(id: string, text: string): void {
    const sanitized = sanitizePromptQueueText(text);
    if (!sanitized) {
      this.remove(id);
      return;
    }
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return;
    this.items = this.items.map((item) => item.id === id ? { ...item, text: sanitized } : item);
    this.persist();
  }

  /** Removes one queue item by id. */
  remove(id: string): void {
    const next = this.items.filter((item) => item.id !== id);
    if (next.length === this.items.length) return;
    this.items = next;
    this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, this.items.length - 1));
    this.pendingDeleteKey = false;
    if (this.pendingDispatchId === id) this.pendingDispatchId = undefined;
    if (this.items.length === 0) this.focused = false;
    this.persist();
  }

  /** Persists the current queue snapshot. */
  private persist(): void {
    this.onChange(this.getItems());
  }
}
