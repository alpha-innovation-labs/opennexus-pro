import type { WorkflowTask } from "../workflow/task.js";
import { WORKFLOW_TICK_MS } from "./workflow-card.js";

/** Presentation-owned repaint cadence, independent of optional fleet/widget timers. */
export class WorkflowTranscriptUpdates {
  private readonly rows = new Map<string, () => void>();
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly tasks: ReadonlyMap<string, WorkflowTask>) {}

  observe(taskId: string, invalidate: () => void): void {
    const task = this.tasks.get(taskId);
    if (!task || (task.status !== "running" && task.status !== "paused")) return;
    this.rows.set(taskId, invalidate);
    if (!this.timer) {
      this.timer = setInterval(() => this.tick(), WORKFLOW_TICK_MS);
      this.timer.unref?.();
    }
  }

  private tick(): void {
    for (const [id, invalidate] of this.rows) {
      const task = this.tasks.get(id);
      // Remove settled rows BEFORE invalidating: Pi may synchronously rebuild
      // their renderer. They still receive one final paint with the outcome.
      if (!task || (task.status !== "running" && task.status !== "paused")) this.rows.delete(id);
      if (task) invalidate();
    }
    if (this.rows.size === 0) this.dispose();
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.rows.clear();
  }
}
