import assert from "node:assert/strict";
import test from "node:test";
import { RtkSavingsModal } from "../../../packages/extensions-pro/src/rtk/ui/RtkSavingsModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a savings modal with many priced OpenRouter model options.
 *
 * @returns Savings modal ready for virtual-terminal rendering.
 */
function createModelPanelModal(): RtkSavingsModal {
  const modal = new RtkSavingsModal(createTestTheme(), {
    availableModels: [
      { id: "openai/gpt-5.5", label: "GPT 5.5", pricing: { cachedInput: 0.0000005, input: 0.000005, modelId: "openai/gpt-5.5", output: 0.00003 } },
      { id: "moonshotai/kimi-k2.5", label: "Kimi K2.5", pricing: { cachedInput: 0.00000022, input: 0.00000044, modelId: "moonshotai/kimi-k2.5", output: 0.000002 } },
      ...Array.from({ length: 24 }, (_, index) => ({
        id: `openrouter/model-${index}`,
        label: `Extra Model ${index}`,
        pricing: { cachedInput: 0, input: 0, modelId: `openrouter/model-${index}`, output: 0 },
      })),
    ],
    pricingModelId: "openai/gpt-5.5",
    rtk: {
      daily: [{ commands: 1, input_tokens: 100, output_tokens: 20, saved_tokens: 80, savings_pct: 80, total_time_ms: 5, avg_time_ms: 5, date: "2026-04-27" }],
      summary: { total_commands: 1, total_input: 100, total_output: 20, total_saved: 80, avg_savings_pct: 80, total_time_ms: 5, avg_time_ms: 5 },
    },
  }, () => undefined);
  modal.handleInput("m");
  return modal;
}

test("/savings model panel stays inside the wterm viewport", async () => {
  const viewport = await renderComponentInVirtualTerminal(() => createModelPanelModal(), 96, 18);
  const output = viewport.join("\n");

  assert.match(output, /Pricing model/u);
  assert.match(output, /GPT 5\.5 \(m\)/u);
  assert.match(output, /Filter: type to filter/u);
  assert.match(viewport.at(-1) ?? "", /└/u);
  assert.equal(viewport.some((line) => line.includes("Extra Model 23")), false);
});

test("/savings model panel filters by typed input in wterm", async () => {
  const modal = createModelPanelModal();
  modal.handleInput("K");
  modal.handleInput("i");
  const viewport = await renderComponentInVirtualTerminal(() => modal, 96, 18);
  const output = viewport.join("\n");

  assert.match(output, /Kimi K2\.5/u);
  assert.match(output, /Filter: Ki/u);
  assert.doesNotMatch(output, /Extra Model/u);
  assert.match(viewport.at(-1) ?? "", /└/u);
});
