Registers `/editor` as the human-facing entrypoint for the hardcoded Markdown editor modal.

## Usage

```ts
import { registerEditorCommand } from '../../../../../../src/extensions/md-editor/command/registerEditorCommand.js';

registerEditorCommand(pi, {
  fileName: 'demo.md',
});
```

## Inputs

```ts
type RegisterEditorCommandInput = {
  pi: ExtensionAPI; // Receives the slash command registration callback.
  fileName: 'demo.md'; // First version is intentionally hardcoded to demo.md.
};
```

## Outputs

```ts
type RegisterEditorCommandOutput = void;
```

## Errors

```ts
type RegisterEditorCommandError =
  | { type: 'CommandRegistrationError'; message: string }
  | { type: 'EditorModalLaunchError'; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| editor_command_opens_demo_md | Running `/editor` opens the shared modal against `demo.md` and does not require an existing file. |
