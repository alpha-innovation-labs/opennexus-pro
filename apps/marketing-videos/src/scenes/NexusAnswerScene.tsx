import { useCurrentFrame } from "remotion";
import { getStreamedText } from "../animation/getStreamedText";
import { getStreamingLines } from "../animation/getStreamingLines";
import { AssistantMarkdown } from "../nexus-terminal/AssistantMarkdown";
import { NexusTerminal } from "../nexus-terminal/NexusTerminal";
import { OverlayCallout } from "../nexus-terminal/OverlayCallout";
import { Promptline } from "../nexus-terminal/Promptline";
import { ThinkingBox } from "../nexus-terminal/ThinkingBox";
import { ToolCallBox } from "../nexus-terminal/ToolCallBox";
import { UserBubble } from "../nexus-terminal/UserBubble";

export type NexusAnswerSceneProps = { readonly startFrame: number };
const THINKING = "Inspecting the smallest set of files before editing";
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
  const thinking = getStreamedText(THINKING, local, 18, 1.2);
  const answerLines = getStreamingLines(ANSWER, local, 116, 0.8);

  return (
    <NexusTerminal overlay={<OverlayCallout text="Reduce visual overload" startFrame={props.startFrame + 178} />}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "58px 70px 44px", boxSizing: "border-box" }}>
        <div style={{ flex: 1 }}>
          <UserBubble text="refactor checkout recovery and tell me what changed" />
          {thinking ? <ThinkingBox label={thinking} /> : null}
          {local > 62 ? <ToolCallBox icon="󰈞" label="grep" main="checkout recovery references" /> : null}
          {local > 82 ? <ToolCallBox icon="󰈙" label="read" main="src/checkout/recovery.ts · test/checkout-recovery.test.ts" /> : null}
          {local > 102 ? <ToolCallBox icon="󰏫" label="edit" main="isolated retry policy" added={32} removed={9} bottom /> : null}
          {answerLines.length > 0 ? <AssistantMarkdown lines={answerLines} /> : null}
        </div>
        <Promptline text="" />
      </div>
    </NexusTerminal>
  );
}
