import { palette } from "../design/palette";
import { terminalTextStyle } from "./terminalStyles";

export type UserBubbleProps = {
  readonly text: string;
};

/**
 * Renders the Tron compact user-message bubble without text-drawn bars.
 *
 * @param props User message content.
 * @returns Bordered user bubble.
 */
export function UserBubble(props: UserBubbleProps): JSX.Element {
  return (
    <div style={{ ...terminalTextStyle(25), color: palette.text, display: "inline-block", maxWidth: "92%", border: `1.5px solid ${palette.rose}`, borderRadius: 14, padding: "12px 18px", background: `${palette.panelAlt}bb`, boxShadow: `0 0 20px ${palette.rose}11` }}>
      <span style={{ color: palette.rose }}>» </span>{props.text}
    </div>
  );
}
