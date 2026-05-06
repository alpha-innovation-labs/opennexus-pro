export type WhichKeyEntry = {
  label: string;
  keys: string;
};

export type WhichKeyGroup = {
  title: string;
  shortcuts: WhichKeyEntry[];
};

export type WhichKeyKeybindings = {
  getResolvedBindings?: () => Record<string, string | string[] | undefined>;
  getEffectiveConfig?: () => Record<string, string | string[] | undefined>;
  getDefinition?: (keybinding: string) => { description?: string };
};

export type WhichKeyExtensionShortcut = {
  shortcut: string;
  description?: string;
  extensionPath?: string;
};
