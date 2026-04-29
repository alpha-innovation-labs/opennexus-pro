import { interpolate } from "remotion";

/**
 * Calculates a scene opacity with a soft in/out envelope.
 *
 * @param frame Current video frame.
 * @param startFrame First frame owned by the scene.
 * @param durationInFrames Total frame count for the scene.
 * @returns Opacity between zero and one.
 */
export function getSceneOpacity(frame: number, startFrame: number, durationInFrames: number): number {
  return interpolate(
    frame,
    [startFrame, startFrame + 18, startFrame + durationInFrames - 18, startFrame + durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}
