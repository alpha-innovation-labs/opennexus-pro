import { interpolate, useCurrentFrame } from "remotion";
import { getStreamingLines } from "../animation/getStreamingLines";
import { AssistantMarkdown } from "../nexus-terminal/AssistantMarkdown";
import { NexusTerminal } from "../nexus-terminal/NexusTerminal";
import { OverlayCallout } from "../nexus-terminal/OverlayCallout";
import { Promptline } from "../nexus-terminal/Promptline";
import { UserBubble } from "../nexus-terminal/UserBubble";

export type NexusManyPromptsSceneProps = { readonly startFrame: number };
const PROMPT = "what is this feature about, oh and btw how do we add tests, and explain the release risk when done";
const RESPONSE = ["## 1. **What is the feature about?**", "It reduces token waste by keeping the answer compact and source-backed.", "", "## 2. **How should tests be added?**", "Add deterministic coverage around prompt structure, compact output, and terminal rendering.", "", "## 3. **What release risk remains?**", "Verify the bundle never exposes source and the Nexus branding stays visible."];

/**
 * Demonstrates Nexus splitting a human multi-ask prompt into structured sections.
 *
 * @param props Scene start frame.
 * @returns Multi-prompt terminal scene.
 */
export function NexusManyPromptsScene(props: NexusManyPromptsSceneProps): JSX.Element {
  const frame = useCurrentFrame();
  const local = frame - props.startFrame;
  const chars = Math.floor(interpolate(local, [18, 108], [0, PROMPT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const responseLines = getStreamingLines(RESPONSE, local, 142, 0.8);

  return (
    <NexusTerminal overlay={<OverlayCallout text="Keeps track of your many prompts" startFrame={props.startFrame + 232} />}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "58px 70px 44px", boxSizing: "border-box" }}>
        <div style={{ flex: 1 }}>
          {local < 122 ? null : <UserBubble text={PROMPT} />}
          {responseLines.length > 0 ? <AssistantMarkdown lines={responseLines} /> : null}
        </div>
        <Promptline text={local < 122 ? PROMPT.slice(0, chars) : ""} />
      </div>
    </NexusTerminal>
  );
}
