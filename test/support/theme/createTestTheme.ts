/**
 * Creates a minimal theme stub for extension rendering tests.
 *
 * @returns Theme-like formatting helpers.
 */
export function createTestTheme(): any {
  return {
    fg(_color: string, value: string): string {
      return value;
    },
    bold(value: string): string {
      return value;
    },
    italic(value: string): string {
      return value;
    },
    strikethrough(value: string): string {
      return value;
    },
  };
}
