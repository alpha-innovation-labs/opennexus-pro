import assert from "node:assert/strict";
import test from "node:test";
import { createDevModalVariations } from "../../../packages/extensions/src/dev/modal/createDevModalVariations.js";
import { DevModal } from "../../../packages/extensions/src/dev/modal/DevModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("dev modal renders variation tabs and sample data", async () => {
  const modal = new DevModal({
    onClose: () => undefined,
    onRenderNeeded: () => undefined,
    theme: createTestTheme(),
    variations: createDevModalVariations(),
  });

  const viewport = await renderComponentInVirtualTerminal(() => modal, 80, 16);
  const output = viewport.join("\n");

  assert.match(output, /● Main/);
  assert.match(output, /○ Spec/);
  assert.match(output, /Status: ready/);
});

test("dev modal cycles variations with tab and shift tab", async () => {
  const modal = new DevModal({
    onClose: () => undefined,
    onRenderNeeded: () => undefined,
    theme: createTestTheme(),
    variations: createDevModalVariations(),
  });

  modal.handleInput("\t");
  const specViewport = await renderComponentInVirtualTerminal(() => modal, 80, 16);
  modal.handleInput("\u001b[Z");
  const mainViewport = await renderComponentInVirtualTerminal(() => modal, 80, 16);

  assert.match(specViewport.join("\n"), /● Spec/);
  assert.match(specViewport.join("\n"), /Variant: compact/);
  assert.match(mainViewport.join("\n"), /● Main/);
});

test("dev modal fullscreen fills configured rows and keeps its bottom border", async () => {
  let renderNeeded = false;
  const modal = new DevModal({
    fullScreenRows: 16,
    onClose: () => undefined,
    onRenderNeeded: () => {
      renderNeeded = true;
    },
    theme: createTestTheme(),
    variations: createDevModalVariations(),
  });

  modal.handleInput("f");
  const viewport = await renderComponentInVirtualTerminal(() => modal, 80, 16);

  assert.equal(renderNeeded, true);
  assert.equal(viewport.length, 16);
  assert.equal(viewport[0]?.startsWith("┌"), true);
  assert.equal(viewport.at(-1)?.startsWith("└"), true);
});

test("dev modal calls close on escape", () => {
  let closed = false;
  const modal = new DevModal({
    onClose: () => {
      closed = true;
    },
    onRenderNeeded: () => undefined,
    theme: createTestTheme(),
    variations: createDevModalVariations(),
  });

  modal.handleInput("\u001b");

  assert.equal(closed, true);
});
