import { palette } from "../../design/palette";

export type TradePanelProps = {
  readonly mode: "idle" | "buy" | "sell";
  readonly livePrice: string;
};

const teal = "#14b8a6";

/**
 * Renders buy and sell actions for the selected Bags item.
 *
 * @param props Current action emphasis and live price.
 * @returns Trade action panel.
 */
export function TradePanel(props: TradePanelProps): JSX.Element {
  const buyActive = props.mode === "buy";
  const sellActive = props.mode === "sell";

  return (
    <div style={{ border: `1px solid ${palette.slate}`, borderRadius: 24, padding: 42, background: palette.panel, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, boxShadow: `0 0 70px ${palette.indigo}22` }}>
      <div style={{ gridColumn: "1 / 3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: palette.text, fontSize: 38, fontWeight: 900 }}>Trade $NXS</div>
          <div style={{ color: palette.fog, marginTop: 12, fontSize: 22 }}>Nexus token · live mark {props.livePrice}</div>
        </div>
        <div style={{ color: palette.violet, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 24 }}>wallet ready</div>
      </div>
      <button style={{ border: 0, borderRadius: 22, padding: "44px 32px", color: palette.black, background: buyActive ? teal : `${teal}cc`, fontSize: 42, fontWeight: 950, boxShadow: buyActive ? `0 0 42px ${teal}88` : "none" }}>BUY</button>
      <button style={{ border: 0, borderRadius: 22, padding: "44px 32px", color: palette.black, background: sellActive ? palette.rose : `${palette.rose}cc`, fontSize: 42, fontWeight: 950, boxShadow: sellActive ? `0 0 42px ${palette.rose}88` : "none" }}>SELL</button>
      <div style={{ gridColumn: "1 / 3", color: buyActive ? teal : sellActive ? palette.rose : palette.ash, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 24 }}>
        {props.mode === "idle" ? "choose side" : `${props.mode.toUpperCase()} order staged at ${props.livePrice}`}
      </div>
    </div>
  );
}
