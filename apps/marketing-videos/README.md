# Nexus Remotion marketing video

A workspace Remotion app for high-impact Nexus marketing videos. The first composition opens with the Nexus startup logo, then shows fullscreen Nexus terminal demos for typing, compact Tron output, and structured multi-prompt answers. The standalone `BagsTuiDemo` composition shows a TUI fetching Bags projects, charting a token, and staging buy/sell actions.

## Source-backed design cues

- `packages/assets/src/themes/nexus-black.json` provides the visual palette.
- `packages/extension-core/src/startup-logo/buildStartupLogoLines.ts` provides the Nexus wordmark direction.
- `packages/extension-core/src/neo-editor/features/promptline/` provides the promptline framing, usage labels, and input prefix behavior.
- `packages/extension-core/src/tron/thinking/` and `packages/extension-core/src/tron/compact-tool-lines/` provide the thinking and tool-call box styling.
- `packages/assets/src/prompts/base-system-prompt/baseSystemPrompt.ts` provides the compact-answer and multi-part prompt behavior shown in the demo.

## Commands

```bash
cd apps/marketing-videos
npm install
npm run preview
npm run render
npm run render:bags
```

The render targets are `out/nexus-showcase.mp4` and `out/bags-tui-demo.mp4`.
