import { interpolate, useCurrentFrame } from "remotion";
import { nexusLogoLines } from "../data/nexusLogoLines";
import { palette } from "../design/palette";
import { terminalTextStyle } from "./terminalStyles";

export type StartupLogoProps = {
  readonly startFrame: number;
  readonly fontSize: number;
};

/**
 * Renders the source-backed Nexus block wordmark with staggered reveal.
 *
 * @param props Animation start and font size.
 * @returns Animated startup logo.
 */
export function StartupLogo(props: StartupLogoProps): JSX.Element {
  const frame = useCurrentFrame();
  const rows: JSX.Element[] = [];

  for (let index = 0; index < nexusLogoLines.length; index += 1) {
    const opacity = interpolate(frame, [props.startFrame + index * 4, props.startFrame + 18 + index * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    rows.push(
      <div key={nexusLogoLines[index]} style={{ opacity, color: palette.lavender, textShadow: `0 0 24px ${palette.lavender}77` }}>
        {nexusLogoLines[index]}
      </div>,
    );
  }

  return <div style={{ ...terminalTextStyle(props.fontSize), textAlign: "center", fontWeight: 800 }}>{rows}</div>;
}
