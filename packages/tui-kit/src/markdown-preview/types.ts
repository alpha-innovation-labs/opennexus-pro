/** Semantic style slots emitted by the markdown preview renderer. */
export type MarkdownPreviewStyleToken =
  | "blockquote.marker"
  | "blockquote.text"
  | "checkbox.checked"
  | "checkbox.todo"
  | "checkbox.unchecked"
  | "codeBlock.background"
  | "codeBlock.border"
  | "codeBlock.header"
  | "codeBlock.icon"
  | "codeBlock.lineNumber"
  | "emphasis"
  | "frontmatter.border"
  | "frontmatter.key"
  | "frontmatter.marker"
  | "frontmatter.value"
  | "heading.h1.background"
  | "heading.h2.background"
  | "heading.h3.background"
  | "heading.h4.background"
  | "heading.h5.background"
  | "heading.h6.background"
  | "horizontalRule"
  | "inlineCode"
  | "lineNumber"
  | "lineNumberSeparator"
  | "link"
  | "list.marker"
  | "strikethrough"
  | "strong";

/** Theme hook used to decorate rendered markdown preview segments. */
export type MarkdownPreviewTheme = {
  style(token: MarkdownPreviewStyleToken, value: string): string;
};

/** Options accepted by the markdown preview renderer. */
export type MarkdownPreviewOptions = {
  markdown: string;
  theme?: MarkdownPreviewTheme;
  width: number;
};

/** Parsed inline text segment. */
export type MarkdownInlineSegment = {
  kind: "plain" | "strong" | "emphasis" | "strongEmphasis" | "inlineCode" | "link" | "strikethrough";
  text: string;
  url?: string;
};

/** Parsed fenced code block. */
export type MarkdownCodeBlock = {
  language: string;
  lines: string[];
};

/** Rendered preview row with source-line metadata. */
export type MarkdownPreviewRow = {
  line: string;
  sourceLine?: number;
};
