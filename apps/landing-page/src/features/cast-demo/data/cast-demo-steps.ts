export interface CastDemoStep {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
}

/** Scroll-driven copy panels shown next to the sticky cast player. */
export const castDemoSteps: readonly CastDemoStep[] = [
  {
    eyebrow: "Recorded terminal demo",
    title: "Watch Nexus stay in flow.",
    body: "The terminal stays visible while the story changes beside it, matching the pi.dev scroll treatment with Nexus branding.",
  },
  {
    eyebrow: "Agent work, visible",
    title: "Every action remains inspectable.",
    body: "The cast keeps command output, tool calls, and terminal state in view while surrounding copy explains the workflow.",
  },
  {
    eyebrow: "Built for TUIs",
    title: "A real terminal session, not a video.",
    body: "Asciinema replays the cast as terminal data, so colors, fonts, and glyphs stay sharp across screen sizes.",
  },
];
