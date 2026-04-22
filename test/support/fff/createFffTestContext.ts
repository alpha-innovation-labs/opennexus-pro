import type { TestContext } from "./types.js";

/**
 * Creates one test session context and captures UI notifications.
 *
 * @param cwd Session cwd.
 * @returns Session context and collected notifications.
 */
export function createFffTestContext(cwd: string): { ctx: TestContext; notifications: Array<{ message: string; level: string }> } {
  const notifications: Array<{ message: string; level: string }> = [];
  return {
    ctx: {
      cwd,
      hasUI: true,
      ui: {
        notify(message: string, level: string) {
          notifications.push({ message, level });
        },
      },
    },
    notifications,
  };
}
