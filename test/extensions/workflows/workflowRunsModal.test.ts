import assert from "node:assert/strict";
import test from "node:test";
import { WorkflowRunsModal } from "../../../packages/extensions/src/workflows/modal/WorkflowRunsModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Verifies workflow runs render visible run, step, and request details instead of only loading the module.
 */
test("WorkflowRunsModal renders workflow runs and step details", async () => {
  const modal = new WorkflowRunsModal(createTestTheme() as never, [
    {
      id: "workflow-1",
      workflowName: "Checkout fix",
      status: "running",
      request: "Repair checkout regression",
      updatedAt: 1_775_000_000_000,
      steps: [
        {
          id: "step-1",
          label: "Investigate failing checkout",
          status: "running",
          agentId: undefined,
        },
      ],
    },
  ] as never, () => undefined);

  const output = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(output, /Workflow runs/);
  assert.match(output, /Checkout fix/);
  assert.match(output, /Investigate failing checkout/);
  assert.match(output, /Repair checkout regression/);
});
