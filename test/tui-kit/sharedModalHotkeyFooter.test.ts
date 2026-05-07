import assert from "node:assert/strict";
import test from "node:test";
import { SharedModal } from "../../packages/tui-kit/src/modal/SharedModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

/**
 * Creates a theme that marks purple hotkey text for assertions.
 *
 * @returns Theme-like formatting helpers.
 */
function createMarkedPurpleTheme(): ReturnType<typeof createTestTheme> {
  return {
    ...createTestTheme(),
    fg(color: string, value: string): string {
      if (color === "accent") return `<purple>${value}</purple>`;
      if (color === "dim") return `<dim>${value}</dim>`;
      return value;
    },
  };
}

test("SharedModal renders base scroll hotkeys in the footer", () => {
  const modal = new SharedModal({
    fullScreen: true,
    fullScreenRows: 8,
    panes: [{ id: "body", size: 1, lines: Array.from({ length: 20 }, (_, index) => `Line ${index + 1}`) }],
    theme: createMarkedPurpleTheme(),
  });

  const output = modal.render(220).join("\n");

  assert.match(output, /<purple>j\/k<\/purple> <dim>scroll<\/dim>/u);
  assert.match(output, /<purple>gg\/G<\/purple> <dim>top\/bottom<\/dim>/u);
  assert.match(output, /<purple>Ctrl\+D\/U<\/purple> <dim>half page<\/dim>/u);
});

test("SharedModal renders override hotkeys on the footer left", () => {
  const modal = new SharedModal({
    footerHotkeys: [{ key: "q", label: "close" }],
    fullScreen: true,
    fullScreenRows: 8,
    panes: [{ id: "body", size: 1, lines: Array.from({ length: 20 }, (_, index) => `Line ${index + 1}`) }],
    theme: createMarkedPurpleTheme(),
  });

  const footerLine = modal.render(220).find((line) => line.includes("close")) ?? "";

  assert.match(footerLine, /^│<purple>q<\/purple> <dim>close<\/dim>/u);
  assert.match(footerLine, /<purple>j\/k<\/purple>/u);
});

test("SharedModal composes modal and base hotkeys on one footer line", () => {
  const modal = new SharedModal({
    footerHotkeys: [{ key: "Esc/Ctrl+C/q", label: "closes" }],
    fullScreen: true,
    fullScreenRows: 8,
    panes: [{ id: "body", size: 1, lines: Array.from({ length: 20 }, (_, index) => `Line ${index + 1}`) }],
    theme: createMarkedPurpleTheme(),
  });

  const footerLines = modal.render(140).filter((line) => line.includes("closes") || line.includes("scroll"));

  assert.equal(footerLines.length, 1);
  assert.match(footerLines[0] ?? "", /<purple>Esc\/Ctrl\+C\/q<\/purple> <dim>closes<\/dim><dim> · <\/dim><purple>j\/k<\/purple> <dim>scroll<\/dim>/u);
});

test("SharedModal keeps base hotkeys with override hotkeys even when body does not overflow", () => {
  const modal = new SharedModal({
    footerHotkeys: [{ key: "Esc/Ctrl+C/q", label: "closes" }],
    panes: [{ id: "body", size: 1, lines: ["Line 1"] }],
    theme: createMarkedPurpleTheme(),
  });

  const output = modal.render(220).join("\n");

  assert.match(output, /<purple>Esc\/Ctrl\+C\/q<\/purple> <dim>closes<\/dim><dim> · <\/dim><purple>j\/k<\/purple> <dim>scroll<\/dim>/u);
});

test("SharedModal wraps hotkey footer segments when they do not fit", () => {
  const modal = new SharedModal({
    footerHotkeys: [
      { key: "j/k", label: "scroll 0/7" },
      { key: "gg", label: "top" },
      { key: "G", label: "bottom" },
      { key: "/", label: "filter" },
      { key: "Esc/Ctrl+C/?", label: "closes" },
      { key: "q", label: "closes" },
    ],
    fullScreen: true,
    fullScreenRows: 10,
    maxWidth: 50,
    panes: [{ id: "body", size: 1, lines: Array.from({ length: 20 }, (_, index) => `Line ${index + 1}`) }],
    theme: createMarkedPurpleTheme(),
  });

  const footerLines = modal.render(80).filter((line) => line.includes("scroll") || line.includes("filter") || line.includes("closes"));

  assert.equal(footerLines.length > 1, true);
  assert.equal(footerLines.some((line) => line.includes("<purple>j/k</purple> <dim>scroll 0/7</dim>")), true);
  assert.equal(footerLines.some((line) => line.includes("<purple>Esc/Ctrl+C/?</purple> <dim>closes</dim>")), true);
});
