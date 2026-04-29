import { palette } from "../../design/palette";
import { getTickingItemPrice } from "../animation/getTickingItemPrice";
import type { BagsItem } from "../data/bagsItems";

export type BagsItemsListProps = {
  readonly frame: number;
  readonly items: readonly BagsItem[];
  readonly selectedIndex: number;
};

/**
 * Renders all Bags project rows in a compact terminal-native live-price table.
 *
 * @param props Visible items, frame, and active selection.
 * @returns Project list panel.
 */
export function BagsItemsList(props: BagsItemsListProps): JSX.Element {
  return (
    <div style={{ flex: 1, border: `1px solid ${palette.slate}`, borderRadius: 18, overflow: "hidden", background: `${palette.panel}d8` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.7fr 110px", color: palette.ash, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", padding: "10px 16px", borderBottom: `1px solid ${palette.slate}`, fontSize: 16 }}>
        <span>coin</span><span>project</span><span>price</span>
      </div>
      {props.items.map((item, index) => {
        const selected = index === props.selectedIndex;
        const price = getTickingItemPrice(item, index, props.frame);
        const priceColor = price.direction === "up" ? palette.sage : palette.rose;
        return (
          <div key={item.symbol} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.7fr 110px", alignItems: "center", padding: "8px 16px", background: selected ? `${palette.indigo}24` : "transparent", borderBottom: `1px solid ${palette.slate}44`, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 16 }}>
            <b style={{ color: palette.text }}>{item.symbol}</b>
            <span style={{ color: palette.fog, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
            <span style={{ color: priceColor, textAlign: "right" }}>{price.value}</span>
          </div>
        );
      })}
    </div>
  );
}
