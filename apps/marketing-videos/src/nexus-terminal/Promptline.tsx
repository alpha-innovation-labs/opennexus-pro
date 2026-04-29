import { palette } from "../design/palette";
import { TerminalIcon } from "./TerminalIcon";
import { terminalTextStyle } from "./terminalStyles";

export type PromptlineProps = {
  readonly text: string;
  readonly compact?: boolean;
};

/**
 * Renders the Neo promptline frame using the same visual order as the app renderer.
 *
 * @param props Prompt text and compact startup width flag.
 * @returns Promptline frame.
 */
export function Promptline(props: PromptlineProps): JSX.Element {
  const width = props.compact ? "54%" : "100%";
  const rule = "─".repeat(18);
  const bottomRule = "─".repeat(48);

  return (
    <div style={{ width, margin: props.compact ? "0 auto" : 0, ...terminalTextStyle(22), color: palette.text }}>
      <div style={{ color: palette.rose, whiteSpace: "nowrap", overflow: "hidden" }}>
        ╭─ <TerminalIcon glyph="" label="folder" color={palette.rose} /> <span style={{ color: palette.rose }}>~/workspace/nexus-tui-awesome</span>
        <span style={{ color: palette.ash }}> › </span><span style={{ color: palette.ash }}>openai/gpt-5.1 · thinking high</span>
        <span style={{ color: palette.ash }}> › </span><span style={{ color: palette.azure }}>main</span><span style={{ color: palette.amber }}> ✱4</span>
        <span style={{ color: palette.rose }}>{rule}</span> <span style={{ color: palette.sage }}> ▰▰</span><span style={{ color: palette.slate }}>▱▱▱</span> <span style={{ color: palette.sage }}>38%</span> <span style={{ color: palette.rose }}>─╮</span>
      </div>
      <div style={{ color: palette.text, whiteSpace: "nowrap", overflow: "hidden" }}>
        <span style={{ color: palette.rose }}>│» </span>{props.text}<span style={{ display: "inline-block", width: 11, height: 25, marginLeft: 4, background: palette.text, opacity: 0.9, verticalAlign: "text-bottom" }} /><span style={{ color: palette.rose }}> │</span>
      </div>
      <div style={{ color: palette.rose, whiteSpace: "nowrap", overflow: "hidden" }}>
        ╰{bottomRule} <span style={{ color: palette.sage }}>○ 18%</span> <span style={{ color: palette.ash }}>|</span> <span style={{ color: palette.amber }}>◔ 41%</span> ─╯
      </div>
    </div>
  );
}
