import type { CSSProperties } from "react";

export type GlowOrbProps = {
  readonly color: string;
  readonly left: number;
  readonly top: number;
  readonly size: number;
  readonly opacity: number;
};

/**
 * Renders one blurred color orb for motion depth.
 *
 * @param props Orb geometry and color options.
 * @returns Soft ambient glow element.
 */
export function GlowOrb(props: GlowOrbProps): JSX.Element {
  const style: CSSProperties = {
    position: "absolute",
    left: props.left,
    top: props.top,
    width: props.size,
    height: props.size,
    borderRadius: props.size,
    background: props.color,
    filter: "blur(70px)",
    opacity: props.opacity,
  };

  return <div style={style} />;
}
