import { palette } from "../../design/palette";

const trades = [
  { time: "Apr 03 09:42", side: "BUY", token: "$NXS", price: "$0.052", size: "1,250", pnl: "+$1,935" },
  { time: "Apr 11 14:18", side: "BUY", token: "$NXS", price: "$0.184", size: "640", pnl: "+$906" },
  { time: "Apr 19 11:07", side: "SELL", token: "$PEPE", price: "$0.004", size: "8,000", pnl: "+$118" },
  { time: "Apr 28 16:31", side: "BUY", token: "$NXS", price: "$1.60", size: "300", pnl: "open" },
] as const;

/**
 * Renders the user's historical trades after a buy or sell action completes.
 *
 * @returns Nexus-themed historical trades table.
 */
export function HistoricalTradesTable(): JSX.Element {
  return (
    <div style={{ height: "100%", border: `1px solid ${palette.slate}`, borderRadius: 24, background: palette.panel, padding: 42, boxSizing: "border-box", boxShadow: `0 0 70px ${palette.indigo}22` }}>
      <div style={{ color: palette.text, fontSize: 38, fontWeight: 900, marginBottom: 28 }}>Historical trades</div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 0.8fr 0.8fr 0.8fr 0.9fr", color: palette.ash, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 20, padding: "18px 20px", borderBottom: `1px solid ${palette.slate}` }}>
        <span>time</span><span>side</span><span>token</span><span>price</span><span>size</span><span>pnl</span>
      </div>
      {trades.map((trade) => {
        const isBuy = trade.side === "BUY";
        return (
          <div key={`${trade.time}-${trade.token}`} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 0.8fr 0.8fr 0.8fr 0.9fr", alignItems: "center", padding: "24px 20px", borderBottom: `1px solid ${palette.slate}66`, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 23 }}>
            <span style={{ color: palette.fog }}>{trade.time}</span>
            <span style={{ color: isBuy ? "#14b8a6" : palette.rose, fontWeight: 900 }}>{trade.side}</span>
            <span style={{ color: palette.text }}>{trade.token}</span>
            <span style={{ color: palette.text }}>{trade.price}</span>
            <span style={{ color: palette.fog }}>{trade.size}</span>
            <span style={{ color: trade.pnl === "open" ? palette.violet : palette.sage }}>{trade.pnl}</span>
          </div>
        );
      })}
    </div>
  );
}
