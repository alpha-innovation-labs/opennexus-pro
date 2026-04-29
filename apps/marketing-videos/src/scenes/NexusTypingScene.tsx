import { interpolate, useCurrentFrame } from "remotion";
import { NexusTerminal } from "../nexus-terminal/NexusTerminal";
import { Promptline } from "../nexus-terminal/Promptline";
import { StartupLogo } from "../nexus-terminal/StartupLogo";

export type NexusTypingSceneProps = {
  readonly startFrame: number;
};

const PROMPT = "refactor checkout recovery and tell me what changed";

/**
 * Recreates the fresh Nexus terminal state while a user types.
 *
 * @param props Scene start frame.
 * @returns Terminal typing scene.
 */
export function NexusTypingScene(props: NexusTypingSceneProps): JSX.Element {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - props.startFrame);
  const chars = Math.floor(interpolate(local, [10, 72], [0, PROMPT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <NexusTerminal>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px", boxSizing: "border-box", gap: 54 }}>
        <StartupLogo startFrame={props.startFrame + 2} fontSize={26} />
        <Promptline text={PROMPT.slice(0, chars)} compact />
      </div>
    </NexusTerminal>
  );
}
