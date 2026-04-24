import assert from "node:assert/strict";
import test from "node:test";
import { renderCachedUserMessage } from "../../../src/extensions/tron/user-message/renderCachedUserMessage.js";
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
