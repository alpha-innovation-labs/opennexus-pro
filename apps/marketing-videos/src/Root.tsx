import { Composition } from "remotion";
import { VIDEO_DURATION_IN_FRAMES, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./composition/constants";
import { BagsTuiVideo } from "./bags-demo/video/BagsTuiVideo";
import { NexusShowcaseVideo } from "./video/NexusShowcaseVideo";

/**
 * Registers all Remotion compositions for the marketing folder.
 *
 * @returns Remotion composition registry.
 */
export function Root(): JSX.Element {
  return (
    <>
      <Composition
        id="NexusShowcase"
        component={NexusShowcaseVideo}
        durationInFrames={VIDEO_DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="BagsTuiDemo"
        component={BagsTuiVideo}
        durationInFrames={410}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{}}
      />
    </>
  );
}
