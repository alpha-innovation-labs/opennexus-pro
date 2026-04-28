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
    { start: 0, duration: 130, node: <NexusStartupScene startFrame={0} /> },
    { start: 110, duration: 180, node: <NexusTypingScene startFrame={110} /> },
    { start: 260, duration: 340, node: <NexusAnswerScene startFrame={260} /> },
    { start: 580, duration: 320, node: <NexusManyPromptsScene startFrame={580} /> },
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
