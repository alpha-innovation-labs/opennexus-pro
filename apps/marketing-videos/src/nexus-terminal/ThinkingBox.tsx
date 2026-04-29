import { palette } from "../design/palette";
import { TerminalIcon } from "./TerminalIcon";
import { terminalTextStyle } from "./terminalStyles";

export type ThinkingBoxProps = {
  readonly label: string;
};

/**
 * Renders a compact Tron thinking box using the product thinking glyph.
 *
 * @param props Thinking summary label.
 * @returns Bordered thinking box.
 */
export function ThinkingBox(props: ThinkingBoxProps): JSX.Element {
  return (
    <div style={{ ...terminalTextStyle(24), color: palette.fog, width: "100%", border: `1.5px solid ${palette.slate}`, borderRadius: "14px 14px 0 0", padding: "10px 16px", boxSizing: "border-box", marginTop: 22, fontStyle: "italic" }}>
      <TerminalIcon glyph="󰧑" label="thinking" color={palette.lavender} /> <span>{props.label}</span>
    </div>
  );
}
