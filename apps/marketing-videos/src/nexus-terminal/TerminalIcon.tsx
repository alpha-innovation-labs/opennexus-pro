import { palette } from "../design/palette";

export type TerminalIconProps = {
  readonly glyph: string;
  readonly label: string;
  readonly color?: string;
};

/**
 * Renders a Nerd Font glyph using the same icon characters as Nexus.
 *
 * @param props Icon glyph, accessible label, and color.
 * @returns Styled icon glyph.
 */
export function TerminalIcon(props: TerminalIconProps): JSX.Element {
  return <span aria-label={props.label} style={{ color: props.color ?? palette.lavender }}>{props.glyph}</span>;
}
