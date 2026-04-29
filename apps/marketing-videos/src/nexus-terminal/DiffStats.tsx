import { palette } from "../design/palette";

export type DiffStatsProps = {
  readonly added: number;
  readonly removed: number;
};

/**
 * Renders edit/write diff stats with Nexus success and error colors.
 *
 * @param props Added and removed line counts.
 * @returns Styled diff stat fragment.
 */
export function DiffStats(props: DiffStatsProps): JSX.Element {
  return (
    <span>
      <span style={{ color: palette.sage }}>+{props.added}</span>{" "}
      <span style={{ color: palette.rose }}>-{props.removed}</span>
    </span>
  );
}
