import assert from "node:assert/strict";
import test from "node:test";
import { setUserMessageMetadata } from "../../../packages/extensions/src/tron/user-message/metadata/userMessageMetadataStore.js";
import { renderCachedUserMessage } from "../../../packages/extensions/src/tron/user-message/renderCachedUserMessage.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

/**
 * Creates a minimal user-message component stub.
 *
 * @param text Message text.
 * @returns Component stub.
 */
function createUserMessageComponent(text: string): { text: string } {
  return { text };
}

test("tron user message renderer reuses cached lines for unchanged text and width", async () => {
  await initializePiThemes();
  const component = createUserMessageComponent("Plan the refactor");

  const first = renderCachedUserMessage(component, 80);
  const second = renderCachedUserMessage(component, 80);

  assert.equal(second, first);
});

test("tron user message renderer refreshes cached lines when width changes", async () => {
  await initializePiThemes();
  const component = createUserMessageComponent("Plan the refactor");

  const first = renderCachedUserMessage(component, 80);
  const second = renderCachedUserMessage(component, 40);

  assert.notEqual(second, first);
});

test("tron user message renderer refreshes cached lines when text changes", async () => {
  await initializePiThemes();
  const component = createUserMessageComponent("Plan the refactor");

  const first = renderCachedUserMessage(component, 80);
  component.text = "Ship the refactor";
  const second = renderCachedUserMessage(component, 80);

  assert.notEqual(second, first);
  assert.match(second.join("\n"), /Ship the refactor/);
});

test("tron user message renderer refreshes cached lines when timestamp metadata changes", async () => {
  await initializePiThemes();
  const component = createUserMessageComponent("Plan the refactor");

  const first = renderCachedUserMessage(component, 80);
  setUserMessageMetadata(component, {
    timestamp: new Date(2026, 3, 14, 14, 56),
    now: new Date(2026, 3, 14, 15, 34),
  });
  const second = renderCachedUserMessage(component, 80);

  assert.notEqual(second, first);
  assert.doesNotMatch(second.join("\n"), /claude-sonnet-4|high|thinking|anthropic/);
  assert.match(second.join("\n"), /2:56 PM/);
});
