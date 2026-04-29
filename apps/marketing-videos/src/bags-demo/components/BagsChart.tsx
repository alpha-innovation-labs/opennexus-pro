import { palette } from "../../design/palette";
import { getChartPath } from "../animation/getChartPath";
import { getChartPoints } from "../data/chartPoints";

export type BagsChartProps = {
  readonly progress: number;
  readonly livePrice: string;
};

/**
 * Renders a full-viewport Nexus-themed dotted Bags price chart for the selected token.
 *
 * @param props Animation progress and live selected-token price.
 * @returns SVG dotted line chart panel.
 */
export function BagsChart(props: BagsChartProps): JSX.Element {
  const width = 1640;
  const height = 760;
  const chartHeight = 610;
  const path = getChartPath(getChartPoints(), width - 150, chartHeight);

  return (
    <div style={{ width: "100%", height: "100%", border: `1px solid ${palette.slate}`, borderRadius: 22, padding: 28, background: palette.panel, boxShadow: `0 0 60px ${palette.indigo}22`, boxSizing: "border-box" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <rect x="0" y="0" width={width} height={height} rx="18" fill={palette.black} />
        {[0, 1, 2, 3, 4, 5].map((line) => <line key={`h-${line}`} x1="0" x2={width - 150} y1={line * 118 + 36} y2={line * 118 + 36} stroke={palette.slate} strokeOpacity="0.55" />)}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => <line key={`v-${line}`} x1={line * 210 + 36} x2={line * 210 + 36} y1="0" y2={height - 78} stroke={palette.slate} strokeOpacity="0.28" />)}
        <g transform="translate(0 34)">
          <path d={path} fill="none" stroke={palette.violet} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 28" />
          <path d={path} fill="none" stroke={palette.azure} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 28" opacity="0.9" />
        </g>
        {['$1.60', '$1.28', '$0.96', '$0.64', '$0.32', '$0.05'].map((label, index) => <text key={label} x={width - 126} y={index * 118 + 45} fill={palette.fog} fontSize="28" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{label}</text>)}
        <rect x={width - 154} y="454" width="136" height="46" rx="10" fill={palette.sage} />
        <text x={width - 142} y="485" fill={palette.black} fontSize="24" fontWeight="900" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{props.livePrice.replace("$", "")}</text>
        {['Apr 01', 'Apr 08', 'Apr 15', 'Apr 22', 'Apr 30'].map((label, index) => <text key={label} x={index * 330 + 24} y={height - 28} fill={palette.ash} fontSize="26" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{label}</text>)}
      </svg>
    </div>
  );
}
