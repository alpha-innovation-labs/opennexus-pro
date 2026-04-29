import { AbsoluteFill } from "remotion";
import { Background } from "../../layout/Background";
import { BagsTuiScene } from "../scenes/BagsTuiScene";

/**
 * Orchestrates the standalone Bags TUI marketing video.
 *
 * @returns Remotion composition content for the Bags TUI demo.
 */
export function BagsTuiVideo(): JSX.Element {
  return (
    <AbsoluteFill>
      <Background />
      <BagsTuiScene />
    </AbsoluteFill>
  );
}
