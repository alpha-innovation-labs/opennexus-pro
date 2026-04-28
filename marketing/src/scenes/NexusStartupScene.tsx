import { AbsoluteFill } from "remotion";
import { StartupLogo } from "../nexus-terminal/StartupLogo";

export type NexusStartupSceneProps = {
  readonly startFrame: number;
};

/**
 * Shows only the quick Nexus startup wordmark animation.
 *
 * @param props Scene start frame.
 * @returns Minimal startup scene.
 */
export function NexusStartupScene(props: NexusStartupSceneProps): JSX.Element {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <StartupLogo startFrame={props.startFrame + 6} fontSize={34} />
    </AbsoluteFill>
  );
}
