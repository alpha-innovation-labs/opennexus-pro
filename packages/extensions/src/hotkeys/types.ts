export type HotkeysEntry = {
  label: string;
  keys: string;
  keybindingId?: string;
};

export type HotkeysGroup = {
  title: string;
  shortcuts: HotkeysEntry[];
};

export type PendingHotkeysConflict = {
  keybindingId: string;
  key: string;
  conflictingIds: string[];
};

export type HotkeysKeybindings = {
  configPath?: string;
  getResolvedBindings?: () => Record<string, string | string[] | undefined>;
  getEffectiveConfig?: () => Record<string, string | string[] | undefined>;
  getUserBindings?: () => Record<string, string | string[] | undefined>;
  setUserBindings?: (userBindings: Record<string, string | string[] | undefined>) => void;
  reload?: () => void;
  getDefinition?: (keybinding: string) => { description?: string };
};

export type HotkeysExtensionShortcut = {
  shortcut: string;
  description?: string;
  extensionPath?: string;
};
