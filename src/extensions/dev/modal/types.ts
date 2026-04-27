export type DevModalVariation = {
  id: string;
  label: string;
  rows: string[];
};

export type DevModalTheme = {
  fg(color: string, value: string): string;
  bold?(value: string): string;
};
