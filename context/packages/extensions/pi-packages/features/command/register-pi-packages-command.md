Registers the `/pi-packages` command. Invoking it opens the package management modal for the current session and does nothing in a non-interactive session.

## Usage

```ts
import { registerPiPackagesExtension } from "./registerPiPackagesExtension";

registerPiPackagesExtension(pi);
```

## Behavior

The extension registers a single command named `pi-packages`. The handler requires an interactive UI: when `ctx.hasUI` is false it emits a warning through `ctx.ui.notify` and returns. Otherwise it hands control to the modal, which owns the package list and the install, remove, update, and toggle actions.

## Inputs

```ts
type RegisterPiPackagesExtensionInput = {
  pi: ExtensionAPI; // Extension registration surface.
};
```

## E2E

| Name | Description |
| --- | --- |
| register-pi-packages-command | Registers the `/pi-packages` command and opens the modal in an interactive session. |
| pi-packages-requires-ui | Emits a warning and returns without a modal when the session has no UI. |
