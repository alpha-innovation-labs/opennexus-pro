import { interpolate, useCurrentFrame } from "remotion";
import { palette } from "../design/palette";

export type OverlayCalloutProps = {
  readonly text: string;
  readonly startFrame: number;
};

/**
 * Shows a small terminal overlay message.
 *
 * @param props Overlay text and animation start.
 * @returns Floating callout pill.
 */
export function OverlayCallout(props: OverlayCalloutProps): JSX.Element {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [props.startFrame, props.startFrame + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", top: 34, left: "50%", transform: "translateX(-50%)", opacity, padding: "16px 26px", borderRadius: 999, color: palette.text, background: `${palette.panelSoft}f2`, border: `1px solid ${palette.lavender}`, boxShadow: `0 0 48px ${palette.lavender}66`, fontSize: 26, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", fontWeight: 800 }}>
      {props.text}
    </div>
  );
}
