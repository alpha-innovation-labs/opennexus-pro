import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { palette } from "../design/palette";

export type NexusTerminalProps = {
  readonly children: ReactNode;
  readonly overlay?: ReactNode;
};

/**
 * Renders the Nexus app inside a framed terminal window.
 *
 * @param props Terminal body and optional overlay content.
 * @returns Fullscreen terminal window surface.
 */
export function NexusTerminal(props: NexusTerminalProps): JSX.Element {
  return (
    <AbsoluteFill style={{ background: palette.pageBg, padding: 34, boxSizing: "border-box" }}>
      <div style={{ position: "relative", height: "100%", border: `1px solid ${palette.slate}`, borderRadius: 24, background: palette.panel, boxShadow: `0 0 110px ${palette.indigo}33`, overflow: "hidden" }}>
        <div style={{ height: 54, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", borderBottom: `1px solid ${palette.slate}`, background: palette.panelAlt }}>
          <div style={{ width: 13, height: 13, borderRadius: 20, background: palette.rose }} />
          <div style={{ width: 13, height: 13, borderRadius: 20, background: palette.amber }} />
          <div style={{ width: 13, height: 13, borderRadius: 20, background: palette.sage }} />
          <div style={{ marginLeft: 16, color: palette.fog, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 18 }}>
            nexus — terminal session
          </div>
        </div>
        <div style={{ position: "relative", height: "calc(100% - 54px)", background: `linear-gradient(180deg, ${palette.panelAlt}, ${palette.panel})` }}>
          {props.children}
          {props.overlay}
        </div>
      </div>
    </AbsoluteFill>
  );
}
