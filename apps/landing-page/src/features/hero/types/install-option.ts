/**
 * Describes one selectable package-manager install command.
 */
export type InstallOption = {
  readonly id: string;
  readonly label: string;
  readonly command: string;
};
