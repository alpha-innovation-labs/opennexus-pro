import { AbsoluteFill, useCurrentFrame } from "remotion";
import { getSceneOpacity } from "../animation/getSceneOpacity";
import { Background } from "../layout/Background";
import { NexusAnswerScene } from "../scenes/NexusAnswerScene";
import { NexusManyPromptsScene } from "../scenes/NexusManyPromptsScene";
import { NexusStartupScene } from "../scenes/NexusStartupScene";
import { NexusTypingScene } from "../scenes/NexusTypingScene";

/**
 * Orchestrates the Nexus startup, terminal typing, compact answer, and multi-prompt demo.
 *
 * @returns Remotion scene stack for the Nexus showcase.
 */
export function NexusShowcaseVideo(): JSX.Element {
  const frame = useCurrentFrame();
  const scenes = [
    { start: 0, duration: 82, node: <NexusStartupScene startFrame={0} /> },
    { start: 62, duration: 168, node: <NexusTypingScene startFrame={62} /> },
    { start: 206, duration: 344, node: <NexusAnswerScene startFrame={206} /> },
    { start: 542, duration: 358, node: <NexusManyPromptsScene startFrame={542} /> },
  ];
  const nodes: JSX.Element[] = [];

  for (const [index, scene] of scenes.entries()) {
    nodes.push(
      <AbsoluteFill key={`scene-${index}`} style={{ opacity: getSceneOpacity(frame, scene.start, scene.duration) }}>
        {scene.node}
      </AbsoluteFill>,
    );
  }

  return (
    <AbsoluteFill>
      <Background />
      {nodes}
    </AbsoluteFill>
  );
}
