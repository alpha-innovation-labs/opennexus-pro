import { interpolate, useCurrentFrame } from "remotion";
import { AssistantMarkdown } from "../nexus-terminal/AssistantMarkdown";
import { NexusTerminal } from "../nexus-terminal/NexusTerminal";
import { OverlayCallout } from "../nexus-terminal/OverlayCallout";
import { Promptline } from "../nexus-terminal/Promptline";
import { ThinkingBox } from "../nexus-terminal/ThinkingBox";
import { ToolCallBox } from "../nexus-terminal/ToolCallBox";
import { UserBubble } from "../nexus-terminal/UserBubble";

export type NexusAnswerSceneProps = { readonly startFrame: number };
const ANSWER = ["Checkout recovery is now isolated and easier to validate.", "", "- Retry policy moved into one focused module.", "- Empty-state copy now points to the recovery action.", "- Regression tests cover expired session and successful retry."];

/**
 * Streams a Nexus answer with Tron thinking and compact tool boxes.
 *
 * @param props Scene start frame.
 * @returns Terminal answer scene.
 */
export function NexusAnswerScene(props: NexusAnswerSceneProps): JSX.Element {
  const frame = useCurrentFrame();
  const local = frame - props.startFrame;
  const visible = Math.floor(interpolate(local, [118, 190], [0, ANSWER.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <NexusTerminal overlay={<OverlayCallout text="Reduce visual overload" startFrame={props.startFrame + 178} />}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "58px 70px 44px", boxSizing: "border-box" }}>
        <div style={{ flex: 1 }}>
          <UserBubble text="refactor checkout recovery and tell me what changed" />
          {local > 28 ? <ThinkingBox label="Inspecting the smallest set of files before editing" /> : null}
          {local > 62 ? <ToolCallBox label="grep" main="checkout recovery references" stats="42 hits" /> : null}
          {local > 86 ? <ToolCallBox label="read" main="src/checkout/recovery.ts · test/checkout-recovery.test.ts" /> : null}
          {local > 108 ? <ToolCallBox label="edit" main="isolated retry policy" stats="+32 -9" bottom /> : null}
          {local > 118 ? <AssistantMarkdown lines={ANSWER.slice(0, visible)} /> : null}
        </div>
        <Promptline text="" />
      </div>
    </NexusTerminal>
  );
}
