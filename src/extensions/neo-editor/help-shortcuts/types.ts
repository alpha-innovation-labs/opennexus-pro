export type HelpShortcut = {
  label: string;
  keys: string;
};

export type HelpShortcutGroup = {
  title: string;
  shortcuts: HelpShortcut[];
};
