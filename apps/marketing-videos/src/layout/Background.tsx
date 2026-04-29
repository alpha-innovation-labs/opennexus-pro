import { AbsoluteFill } from "remotion";
import { palette } from "../design/palette";

/**
 * Paints a black Nexus background with subtle ambient glow.
 *
 * @returns Full-frame layered background.
 */
export function Background(): JSX.Element {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 18% 12%, ${palette.indigo}18 0, transparent 28%), radial-gradient(circle at 82% 26%, ${palette.rose}12 0, transparent 24%), ${palette.black}`,
      }}
    />
  );
}
