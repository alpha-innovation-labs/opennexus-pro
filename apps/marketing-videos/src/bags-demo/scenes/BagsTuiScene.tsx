import { interpolate, useCurrentFrame } from "remotion";
import { palette } from "../../design/palette";
import { NexusTerminal } from "../../nexus-terminal/NexusTerminal";
import { getTickingPrice } from "../animation/getTickingPrice";
import { BagsChart } from "../components/BagsChart";
import { BagsChatPanel } from "../components/BagsChatPanel";
import { BagsHeader } from "../components/BagsHeader";
import { BagsItemsList } from "../components/BagsItemsList";
import { HistoricalTradesTable } from "../components/HistoricalTradesTable";
import { TradePanel } from "../components/TradePanel";
import { getBagsItems } from "../data/bagsItems";

/**
 * Shows a Nexus TUI flow: select a Bags item, open chart details, then open buy/sell.
 *
 * @returns Complete Bags TUI demo scene.
 */
export function BagsTuiScene(): JSX.Element {
  const frame = useCurrentFrame();
  const allItems = getBagsItems();
  const selectedIndex = 9;
  const chartProgress = interpolate(frame, [132, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mode = frame > 286 ? "sell" : frame > 248 ? "buy" : "idle";
  const livePrice = getTickingPrice(frame);
  const page = frame < 118 ? "list" : frame < 235 ? "chart" : frame < 326 ? "trade" : "history";

  return (
    <NexusTerminal>
      <div style={{ height: "100%", padding: 34, boxSizing: "border-box", color: palette.text, fontFamily: "Inter, ui-sans-serif, system-ui" }}>
        {page === "list" ? (
          <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 560px", gap: 24 }}>
            <BagsItemsList frame={frame} items={allItems} selectedIndex={selectedIndex} />
            <BagsChatPanel frame={frame} />
          </div>
        ) : null}
        {page === "chart" ? (
          <div style={{ height: "100%", boxSizing: "border-box" }}>
            <BagsChart progress={chartProgress} livePrice={livePrice} />
          </div>
        ) : null}
        {page === "trade" ? (
          <div style={{ padding: "96px 170px" }}>
            <TradePanel mode={mode} livePrice={livePrice} />
          </div>
        ) : null}
        {page === "history" ? (
          <div style={{ height: "100%", boxSizing: "border-box" }}>
            <HistoricalTradesTable />
          </div>
        ) : null}
      </div>
    </NexusTerminal>
  );
}
