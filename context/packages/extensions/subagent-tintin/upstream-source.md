# Upstream source

The package owns a copy of `tintinweb/pi-subagents`, not the unscoped `pi-subagents` npm package. Runtime implementation lives in `src/`; dependencies are resolved by the Nexus pnpm workspace rather than copied into the package.

## Attribution

`LICENSE` preserves the upstream MIT notice. `UPSTREAM.md` records the source revision and import boundaries. The upstream README, guides, and examples accompany the implementation as reference material.

## Registration boundary

The package exports `src/index.ts` and declares it as its Pi extension entrypoint. Nexus's feature registry and registration map expose it as `subagent-tintin`, enabled by default. The old Herdr `subagents` registration is absent; its source remains in the workspace but its tools are not registered. In normal mode, users can disable the replacement through `/features` or `featureFlags.subagent-tintin = false` in Nexus configuration. The minimal-mode allowlist includes `subagent-tintin`, so `--minimal` and its `-m` alias retain the replacement rather than the old Herdr extension.
