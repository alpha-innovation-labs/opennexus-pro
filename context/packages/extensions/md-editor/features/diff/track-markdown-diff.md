Tracks live Markdown file changes and renders pending word-level additions and removals until the user accepts the baseline.

## Usage

```ts
import { trackMarkdownDiff } from '../../../../../../src/extensions/md-editor/diff/trackMarkdownDiff.js';

const diff = trackMarkdownDiff(previousSnapshot, nextSnapshot);
```

## Inputs

```ts
type TrackMarkdownDiffInput = {
  previous: MarkdownFileSnapshot; // Accepted baseline snapshot.
  next: MarkdownFileSnapshot; // Latest live-reloaded file snapshot.
};
```

## Outputs

```ts
type MarkdownDiffToken = {
  kind: 'unchanged' | 'added' | 'removed';
  text: string;
  style: 'normal' | 'green' | 'red-strikethrough';
  lineNumber: number;
};

type TrackMarkdownDiffOutput = {
  tokens: MarkdownDiffToken[];
  hasPendingDiff: boolean;
};
```

## Errors

```ts
type TrackMarkdownDiffError = { type: 'MarkdownDiffError'; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| editor_file_reload_diff_accept | Renders added words in green and removed words in red strikethrough until Ctrl+A accepts the latest snapshot as the baseline. |
