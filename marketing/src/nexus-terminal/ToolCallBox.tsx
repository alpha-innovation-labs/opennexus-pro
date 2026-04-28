import { palette } from "../design/palette";
import { terminalTextStyle } from "./terminalStyles";

export type ToolCallBoxProps = {
  readonly label: string;
  readonly main: string;
  readonly stats?: string;
  readonly bottom?: boolean;
};

/**
 * Renders one Tron compact tool-call row without text-drawn bars.
 *
 * @param props Tool label, summary, stats, and border state.
 * @returns Bordered tool-call row.
 */
export function ToolCallBox(props: ToolCallBoxProps): JSX.Element {
  return (
    <div style={{ ...terminalTextStyle(24), color: palette.text, width: "100%", borderLeft: `1.5px solid ${palette.slate}`, borderRight: `1.5px solid ${palette.slate}`, borderBottom: props.bottom ? `1.5px solid ${palette.slate}` : undefined, borderRadius: props.bottom ? "0 0 14px 14px" : 0, padding: "10px 16px", boxSizing: "border-box", display: "flex", gap: 14 }}>
      <span style={{ color: palette.lavender }}>◆</span>
      <span style={{ fontWeight: 800 }}>{props.label}</span>
      {props.stats ? <span style={{ color: palette.sage }}>{props.stats}</span> : null}
      <span style={{ color: palette.ash, marginLeft: 8 }}>{props.main}</span>
    </div>
  );
}
