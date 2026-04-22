type ScheduledTask = () => Promise<void>;

/**
 * Creates one in-memory scheduler for queued background subagent work.
 *
 * @param maxConcurrent Maximum tasks allowed to run at once.
 * @returns Queue operations.
 */
export function createSubagentScheduler(maxConcurrent: number) {
  const queue: ScheduledTask[] = [];
  let runningCount = 0;

  /**
   * Starts queued work while capacity remains.
   */
  function drainQueue(): void {
    while (runningCount < maxConcurrent && queue.length > 0) {
      const nextTask = queue.shift();
      if (!nextTask) return;
      runningCount += 1;
      void nextTask().finally(() => {
        runningCount -= 1;
        drainQueue();
      });
    }
  }

  return {
    /**
     * Queues one background task.
     *
     * @param task Task to run.
     */
    schedule(task: ScheduledTask): void {
      queue.push(task);
      drainQueue();
    },
    /**
     * Reports the current queue length.
     *
     * @returns Pending task count.
     */
    getQueueSize(): number {
      return queue.length;
    },
    /**
     * Reports the number of active tasks.
     *
     * @returns Running task count.
     */
    getRunningCount(): number {
      return runningCount;
    },
  };
}
