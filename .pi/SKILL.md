---
name: two-pane-select-modal
summary: Reuse the shared framed two-pane modal used by @ file search and /topics.
---

# Two-Pane Select Modal

Use the shared modal at:

- `.pi/extensions/shared/two-pane-select-modal.ts`

It provides a reusable framed 50/50 two-column modal with:

- left: selectable list
- right: detail/preview pane
- optional bottom input row on the left
- optional ability to hide the left or right pane

## Exported API

### `TwoPaneSelectModal`

Constructor:

```ts
new TwoPaneSelectModal(
  uiTheme,
  onPick,
  onClose,
  onSelectionChange?,
  {
    leftTitle?: string,
    rightTitle?: string,
    bottomTitle?: string,
    bottomPrefix?: string,
    showLeftPane?: boolean,
    showRightPane?: boolean,
  },
)
```

### `sanitizePlainText(text)`

Use for plain file/text preview content before rendering.

---

## Main methods

### `setItems(items)`
Sets the left-pane selectable items.

Items should be `AutocompleteItem[]`:

```ts
{ label: string, value: string, description?: string }
```

### `setRightLines(lines)`
Sets the right-pane rendered lines.

### `setTitles(leftTitle, rightTitle)`
Updates the top border titles.

### `setBottom(title, value, prefix?)`
Configures the optional bottom-left input row.

Example:

```ts
modal.setBottom("Find Files", query, "> @")
```

If you do not want a bottom input area, do not set `bottomTitle`.

---

## Basic usage

```ts
import { TwoPaneSelectModal } from "./extensions/shared/two-pane-select-modal.js";

class MyModal extends TwoPaneSelectModal {
  constructor(theme, done) {
    super(
      theme,
      (item) => done(item),
      () => done(undefined),
      undefined,
      {
        leftTitle: "Things",
        rightTitle: "Detail",
        bottomTitle: "Query",
        bottomPrefix: "> ",
      },
    );

    this.setOnSelectionChange((item) => {
      this.updateDetail(item);
    });

    this.setItems([
      { label: "Alpha", value: "alpha" },
      { label: "Beta", value: "beta" },
    ]);

    this.updateDetail({ label: "Alpha", value: "alpha" });
    this.setBottom("Query", "alpha", "> ");
  }

  updateDetail(item) {
    this.setRightLines([
      item ? item.label : "Nothing selected",
    ]);
  }
}
```

Show it with an overlay:

```ts
await ctx.ui.custom(
  (_tui, theme, _keybindings, done) => new MyModal(theme, done),
  {
    overlay: true,
    overlayOptions: {
      anchor: "center",
      width: "80%",
      minWidth: 80,
      maxHeight: "85%",
    },
  },
);
```

---

## Existing examples

### `@` modal
See:

- `.pi/extensions/neo-editor/registerNeoEditorExtension.ts`

`AtModal` is a thin wrapper around `TwoPaneSelectModal`.

### `/topics` modal
See:

- `.pi/extensions/conversation-metadata/topics-command.ts`

This shows how to use the same modal for a custom command with the right pane hidden.

---

## Behavior notes

- `Esc` closes via the `onClose` callback.
- `Enter` selects the current item via `onPick`.
- Up/down navigation is handled by the internal `SelectList`.
- Rendered lines must fit width; use `sanitizePlainText()` for plain previews.

---

## Recommended pattern

When reusing the modal:

1. create a small wrapper class per use case
2. set items with `setItems(...)`
3. update the right pane in `onSelectionChange` when the right pane is shown
4. set `showLeftPane: false` or `showRightPane: false` when you want a single-pane modal
5. use `setBottom(...)` only when an input/query row is needed
6. show via `ctx.ui.custom(..., { overlay: true })`
