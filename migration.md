```txt
.
├─ apps/
│  ├─ tui/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ index.release.ts
│  │     ├─ cli/
│  │     │  ├─ runCli.ts
│  │     │  ├─ runCliWithApp.ts
│  │     │  ├─ createAppArgs.ts
│  │     │  ├─ adapter/
│  │     │  ├─ extensions/
│  │     │  ├─ sessions/
│  │     │  ├─ system-prompt/
│  │     │  └─ version/
│  │     └─ runtime/
│  │        ├─ runTuiApp.ts
│  │        ├─ runBundledTuiApp.ts
│  │        ├─ runTuiAppWithExtensionFactories.ts
│  │        ├─ boot/
│  │        ├─ extensions/
│  │        └─ startup-screen/
│  │
│  ├─ gateway/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     └─ daemon/
│  │        ├─ ensureGatewayRootDir.ts
│  │        ├─ runGatewayDaemon.ts
│  │        ├─ runGatewayServices.ts
│  │        └─ writeGatewayHeartbeat.ts
│  │
│  ├─ chrome-extension/
│  │  ├─ manifest.json
│  │  ├─ background.js
│  │  ├─ content.js
│  │  ├─ popup.html
│  │  ├─ popup.js
│  │  ├─ icons/
│  │  └─ native/
│  │
│  └─ wterm-e2e/
│     ├─ package.json
│     └─ src/
│        ├─ startWtermE2e.ts
│        ├─ browser/
│        ├─ config/
│        ├─ html/
│        ├─ pty/
│        ├─ server/
│        ├─ socket/
│        └─ ui/
│
├─ packages/
│  ├─ extensions/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ registry/
│  │     ├─ generated/
│  │     ├─ shared/
│  │     ├─ annotate/
│  │     ├─ cmux/
│  │     ├─ context-usage/
│  │     ├─ dev/
│  │     ├─ exit-message/
│  │     ├─ feature-management/
│  │     ├─ fff/
│  │     ├─ kanban/
│  │     ├─ md-editor/
│  │     ├─ neo-editor/
│  │     ├─ notify/
│  │     ├─ observations/
│  │     ├─ playground/
│  │     ├─ primitives/
│  │     ├─ rtk/
│  │     ├─ startup-hero/
│  │     ├─ sub-agent-status-widget/
│  │     ├─ sub-agents/
│  │     ├─ term-modal/
│  │     ├─ todo/
│  │     ├─ tron/
│  │     ├─ slashusage/
│  │     ├─ workflows/
│  │     └─ workspace/
│  │
│  ├─ feature-flags/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ config/
│  │     ├─ extension-flags/
│  │     ├─ generated/
│  │     └─ types.ts
│  │
│  ├─ social-adapters/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ shared/
│  │     ├─ discord/
│  │     └─ telegram/
│  │        ├─ api/
│  │        ├─ config/
│  │        ├─ format/
│  │        ├─ live-status/
│  │        ├─ polling/
│  │        ├─ rpc/
│  │        ├─ runtime/
│  │        └─ session/
│  │
│  ├─ gateway-core/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ commands/
│  │     ├─ paths/
│  │     ├─ process/
│  │     ├─ state/
│  │     └─ shared/
│  │
│  ├─ nexus-runtime/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ agent-dir/
│  │     ├─ clipboard-image/
│  │     ├─ config/
│  │     ├─ launch/
│  │     └─ package/
│  │
│  ├─ pi-platform/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ patches/
│  │     ├─ hooks/
│  │     ├─ inline-image-overlays/
│  │     └─ shims/
│  │
│  ├─ assets/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ commands/
│  │     ├─ prompts/
│  │     ├─ themes/
│  │     └─ default-settings/
│  │
│  ├─ observability/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ startup-debug.ts
│  │     └─ startup-profile/
│  │        ├─ clearStartupProfileLog.ts
│  │        ├─ constants.ts
│  │        ├─ createProfiledExtensionApi.ts
│  │        ├─ isStartupProfileEnabled.ts
│  │        ├─ logStartupProfileEvent.ts
│  │        ├─ startupProfileLogPath.ts
│  │        └─ wrapExtensionEventHandler.ts
│  │
│  ├─ tui-kit/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ modal/
│  │     └─ shortcuts/
│  │
│  └─ types/
│     ├─ package.json
│     └─ src/
│        └─ external.d.ts
│
├─ test/
├─ scripts/
├─ docs/
├─ feature-flags.json
├─ package.json
├─ package-lock.json
├─ turbo.json
└─ tsconfig.base.json
```
