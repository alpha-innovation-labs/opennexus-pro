import type { ReactNode } from "react";
import { palette } from "../design/palette";
import { DiffStats } from "./DiffStats";
import { TerminalIcon } from "./TerminalIcon";
import { terminalTextStyle } from "./terminalStyles";

export type ToolCallBoxProps = {
  readonly label: string;
  readonly main: string;
  readonly added?: number;
  readonly icon: string;
  readonly removed?: number;
  readonly bottom?: boolean;
};

/**
 * Renders one Tron compact tool-call row with product icons and diff colors.
 *
 * @param props Tool label, icon, summary, diff stats, and border state.
 * @returns Bordered tool-call row.
 */
export function ToolCallBox(props: ToolCallBoxProps): JSX.Element {
  let stats: ReactNode = null;
  if (typeof props.added === "number" && typeof props.removed === "number") {
    stats = <DiffStats added={props.added} removed={props.removed} />;
  }

  return (
    <div style={{ ...terminalTextStyle(24), color: palette.text, width: "100%", borderLeft: `1.5px solid ${palette.slate}`, borderRight: `1.5px solid ${palette.slate}`, borderBottom: props.bottom ? `1.5px solid ${palette.slate}` : undefined, borderRadius: props.bottom ? "0 0 14px 14px" : 0, padding: "10px 16px", boxSizing: "border-box", display: "flex", gap: 14 }}>
      <TerminalIcon glyph={props.icon} label={props.label} color={palette.lavender} />
      <span style={{ fontWeight: 800 }}>{props.label}</span>
      {stats}
      <span style={{ color: palette.ash, marginLeft: 8 }}>{props.main}</span>
    </div>
  );
}
