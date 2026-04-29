import { palette } from "../../design/palette";
import { getStreamedText } from "../../animation/getStreamedText";
import { isChatEventVisible } from "../animation/getChatStep";

export type BagsChatPanelProps = {
  readonly frame: number;
};

const userMessage = "What token is pumping right now?";
const finalResponse = "The current pumping token is $NXS. It has the strongest live upticks and a bumpy 30-day move that is still trending up.";

/**
 * Renders a simulated agent chat that types the user prompt, delays tool calls, then types the final answer.
 *
 * @param props Current frame used to reveal chat steps.
 * @returns Nexus-themed chat panel for the Bags list page.
 */
export function BagsChatPanel(props: BagsChatPanelProps): JSX.Element {
  const typedUserMessage = getStreamedText(userMessage, props.frame, 0, 1.2);
  const typedFinalResponse = getStreamedText(finalResponse, props.frame, 78, 1.1);

  return (
    <div style={{ height: "100%", border: `1px solid ${palette.slate}`, borderRadius: 18, background: palette.panel, padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: palette.text, fontSize: 24, fontWeight: 900 }}>Bags agent</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14, overflow: "hidden" }}>
        {isChatEventVisible(props.frame, 34) ? <div style={{ borderRadius: 14, padding: 14, background: palette.black, color: palette.fog, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 16 }}>thinking… checking live ticks, table momentum, and 30d trend</div> : null}
        {isChatEventVisible(props.frame, 48) ? <div style={{ borderRadius: 14, padding: 14, background: palette.panelSoft, color: palette.fog, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 15, lineHeight: 1.55 }}>tool: bags.getTrendingTokens()</div> : null}
        {isChatEventVisible(props.frame, 63) ? <div style={{ borderRadius: 14, padding: 14, background: palette.panelSoft, color: palette.fog, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 15, lineHeight: 1.55 }}>tool: bags.getPriceTicks(window: "live")</div> : null}
        {isChatEventVisible(props.frame, 74) ? <div style={{ borderRadius: 14, padding: 14, background: palette.panelSoft, color: palette.fog, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 15, lineHeight: 1.55 }}>tool: bags.getTokenChart(symbol: "$NXS", range: "30d")</div> : null}
        {typedFinalResponse.length > 0 ? <div style={{ borderRadius: 16, padding: 16, background: `${palette.violet}22`, color: palette.text, fontSize: 20, lineHeight: 1.42 }}>{typedFinalResponse}<span style={{ color: palette.violet }}>{typedFinalResponse.length < finalResponse.length ? "▌" : ""}</span></div> : null}
      </div>
      <div style={{ border: `1px solid ${palette.slate}`, borderRadius: 18, background: palette.black, padding: 16, boxShadow: `0 0 28px ${palette.indigo}22` }}>
        <div style={{ color: palette.text, fontSize: 19, lineHeight: 1.35 }}>{typedUserMessage}<span style={{ color: palette.violet }}>{typedUserMessage.length < userMessage.length ? "▌" : ""}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, color: palette.ash, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 14 }}>
          <span>⌘↵ send</span><span>bags tools enabled</span>
        </div>
      </div>
    </div>
  );
}
