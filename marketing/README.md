# Nexus Remotion marketing video

A standalone Remotion project for a high-impact social launch video that opens with the Nexus startup logo, then shows fullscreen Nexus terminal demos for typing, compact Tron output, and structured multi-prompt answers.

## Source-backed design cues

- `packages/assets/src/themes/nexus-black.json` provides the visual palette.
- `packages/extensions/src/startup-logo/buildStartupLogoLines.ts` provides the Nexus wordmark direction.
- `packages/extensions/src/neo-editor/features/promptline/` provides the promptline framing, usage labels, and input prefix behavior.
- `packages/extensions/src/tron/thinking/` and `packages/extensions/src/tron/compact-tool-lines/` provide the thinking and tool-call box styling.
- `packages/assets/src/prompts/base-system-prompt/baseSystemPrompt.ts` provides the compact-answer and multi-part prompt behavior shown in the demo.

## Commands

```bash
cd marketing
npm install
npm run preview
npm run render
```

The render target is `out/nexus-showcase.mp4`.
