import { palette } from "../design/palette";
import { terminalTextStyle } from "./terminalStyles";

export type AssistantMarkdownProps = {
  readonly lines: string[];
};

/**
 * Renders streamed assistant content with visual markdown styling, not raw markers.
 *
 * @param props Markdown-like source lines to render as styled terminal content.
 * @returns Assistant response block.
 */
export function AssistantMarkdown(props: AssistantMarkdownProps): JSX.Element {
  const nodes: JSX.Element[] = [];

  for (const line of props.lines) {
    const clean = line.replace(/^##\s*/, "").replace(/^[-*]\s*/, "").replace(/\*\*/g, "");
    if (line.startsWith("##")) nodes.push(<div key={`${line}-${nodes.length}`} style={{ color: palette.lavender, fontSize: 28, fontWeight: 850, marginTop: 18 }}>{clean}</div>);
    else if (line.trim().startsWith("-")) nodes.push(<div key={`${line}-${nodes.length}`} style={{ color: palette.text }}><span style={{ color: palette.azure }}>• </span>{clean}</div>);
    else nodes.push(<div key={`${line}-${nodes.length}`} style={{ color: palette.text, minHeight: line ? undefined : 12 }}>{clean}</div>);
  }

  return <div style={{ ...terminalTextStyle(25), marginTop: 18 }}>{nodes}</div>;
}
