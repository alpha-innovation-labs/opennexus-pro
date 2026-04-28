import { palette } from "../design/palette";
import { terminalTextStyle } from "./terminalStyles";

export type PromptlineProps = {
  readonly text: string;
  readonly compact?: boolean;
};

/**
 * Renders the Neo promptline frame used by Nexus input without broken text bars.
 *
 * @param props Prompt text and compact startup width flag.
 * @returns Promptline frame.
 */
export function Promptline(props: PromptlineProps): JSX.Element {
  const width = props.compact ? "55%" : "100%";

  return (
    <div style={{ width, margin: props.compact ? "0 auto" : 0, ...terminalTextStyle(24), color: palette.text }}>
      <div style={{ position: "relative", border: `1.5px solid ${palette.rose}`, borderRadius: 16, background: `${palette.panel}ee`, padding: "28px 16px 22px", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", top: -17, left: 22, right: 22, display: "flex", justifyContent: "space-between", background: palette.panel, padding: "0 12px", color: palette.fog, fontSize: 20 }}>
          <span><span style={{ color: palette.rose }}></span> ~/workspace/nexus-tui-awesome › <span style={{ color: palette.azure }}>main</span></span>
          <span><span style={{ color: palette.fog }}></span> <span style={{ color: palette.sage }}>▰▰</span><span style={{ color: palette.slate }}>▱▱▱</span> 38%</span>
        </div>
        <div style={{ display: "flex", minHeight: 42, alignItems: "center", whiteSpace: "nowrap", overflow: "hidden" }}>
          <span style={{ color: palette.rose }}>» </span>
          <span>{props.text}</span>
          <span style={{ width: 12, height: 27, marginLeft: 4, background: palette.text, opacity: 0.9, flexShrink: 0 }} />
        </div>
        <div style={{ position: "absolute", bottom: -15, right: 26, background: palette.panel, padding: "0 12px", color: palette.ash, fontSize: 19 }}>
          <span style={{ color: palette.sage }}>○ 18%</span> <span style={{ color: palette.ash }}>|</span> <span style={{ color: palette.amber }}>◔ 41%</span>
        </div>
      </div>
    </div>
  );
}
