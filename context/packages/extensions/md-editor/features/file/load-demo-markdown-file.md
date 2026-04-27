Ensures the hardcoded Markdown file exists, loads its content, computes snapshots, and watches it for live reload.

## Usage

```ts
import { loadDemoMarkdownFile } from '../../../../../../src/extensions/md-editor/file/loadDemoMarkdownFile.js';

const snapshot = await loadDemoMarkdownFile({ cwd: process.cwd() });
```

## Inputs

```ts
type LoadDemoMarkdownFileInput = {
  cwd: string; // Working directory used to resolve demo.md.
};
```

## Outputs

```ts
type MarkdownFileSnapshot = {
  filePath: string; // Canonical absolute path for storage keys.
  content: string;
  lines: string[];
  mtimeMs: number;
  contentHash: string;
};
```

## Errors

```ts
type LoadDemoMarkdownFileError =
  | { type: 'MarkdownFileCreateError'; message: string }
  | { type: 'MarkdownFileReadError'; message: string }
  | { type: 'MarkdownFileWatchError'; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| editor_command_opens_demo_md | Creates `demo.md` when missing and opens it with empty Markdown content. |
| editor_file_reload_diff_accept | Detects on-disk changes while open and triggers the modal diff state without making the left panel editable. |
