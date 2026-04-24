import assert from "node:assert/strict";
import test from "node:test";
import { createSubagentScheduler } from "../../../../src/extensions/sub-agents/runtime/createSubagentScheduler.js";

/**
 * Waits for one microtask turn.
 *
 * @returns Promise resolved on the next turn.
 */
function nextTurn(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

test("createSubagentScheduler limits concurrent background work", async () => {
  const scheduler = createSubagentScheduler(1);
  const events: string[] = [];
  let releaseFirst: () => void = () => undefined;

  const firstDone = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });

  scheduler.schedule(async () => {
    events.push("first:start");
    await firstDone;
    events.push("first:end");
  });

  scheduler.schedule(async () => {
    events.push("second:start");
    events.push("second:end");
  });

  await nextTurn();
  assert.deepEqual(events, ["first:start"]);
  assert.equal(scheduler.getRunningCount(), 1);
  assert.equal(scheduler.getQueueSize(), 1);

  releaseFirst();
  await nextTurn();
  await nextTurn();

  assert.deepEqual(events, ["first:start", "first:end", "second:start", "second:end"]);
  assert.equal(scheduler.getRunningCount(), 0);
  assert.equal(scheduler.getQueueSize(), 0);
});
