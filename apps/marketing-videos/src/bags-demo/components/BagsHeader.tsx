import { palette } from "../../design/palette";

export type BagsHeaderProps = {
  readonly itemCount: number;
  readonly livePrice: string;
};

/**
 * Renders the top status bar for the Bags TUI demo.
 *
 * @param props Current item count and live-ticking price.
 * @returns Header row with endpoint and sync status.
 */
export function BagsHeader(props: BagsHeaderProps): JSX.Element {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 30px", borderBottom: `1px solid ${palette.slate}` }}>
      <div>
        <div style={{ color: palette.text, fontSize: 28, fontWeight: 800 }}>Bags inside Nexus</div>
        <div style={{ color: palette.fog, marginTop: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>GET /hackathon/apps • {props.itemCount} live prices</div>
      </div>
      <div style={{ color: palette.sage, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 24 }}>
        live $NXS {props.livePrice}
      </div>
    </div>
  );
}
