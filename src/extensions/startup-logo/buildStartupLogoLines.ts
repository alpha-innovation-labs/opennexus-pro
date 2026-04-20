/**
 * Builds the startup logo lines using the LunarVim-style hardcoded banner-array
 * approach, with the stylized N centered inside a compact orbit and small planet.
 *
 * @param theme UI theme formatter.
 * @returns Styled startup logo lines.
 */
export function buildStartupLogoLines(theme: { fg(name: string, value: string): string }): string[] {
  const lines = [
    "                ⢀⣀⣤⣤⣤⣶⣶⣶⣶⣶⣶⣤⣤⣤⣀⡀                ",
    "             ⣀⣤⣶⣿⠿⠟⠛⠉⠉⠉⠁⠈⠉⠉⠉⠛⠛⠿⣿⣷⣦⣀             ",
    "          ⢀⣤⣾⡿⠛⠉                ⠉⠛⢿⣷⣤⡀          ",
    "         ⣴⣿⡿⠃                      ⠙⠻⣿⣦         ",
    " ⢀⣠⣤⣤⣤⣤⣤⣾⣿⣉⣀⡀                        ⠙⢻⣷⡄       ",
    "⣼⠋⠁   ⢠⣿⡟       ⢀⣀⡀    ⢀⣀      ⢠⣤⣤⡄   ⢻⣿⣆      ",
    "⢻⡄   ⢰⣿⡟        ⢸⣿⣷   ⣿⡇     ⢀⣾⣿⣿⠁    ⢻⣿⡆     ",
    " ⠹⣦⡀ ⣿⣿⠁        ⢸⣿⣿⡄  ⣿⡇   ⣀⣸⣿⣿⠇      ⣿⣷     ",
    "   ⠙⢷⣿⡇         ⢸⣿⡿⣿⣄ ⣿⡇      ⢸⣿⣿⢷⣤⡀     ⢸⣿⡆    ",
    "    ⢸⣿⠇         ⢸⣿⡇⠹⣿⣆⣿⡇    ⢠⣿⣿⡏ ⠈⠙⠳⢦⣄  ⠈⣿⡇    ",
    "    ⢸⣿⡆        ⢸⣿⡇ ⠹⣿⣿⡇    ⢀⣿⣿⡟      ⠈⠙⠷⣤⣿⡇    ",
    "    ⠘⣿⡇        ⢸⣿⡇  ⠹⣿⡇    ⣼⣿⣿⠃         ⢸⣿⠷⣄⡀  ",
    "     ⣿⣿        ⢸⣿⡇   ⠹⡇   ⢸⣿⣿⠃          ⣾⡿ ⠈⠻⣆ ",
    "     ⠸⣿⣧       ⢸⣿⣇⣀⣀⣀⣀⣀⣀⣸⣿⣿⣿⣿⠇          ⣼⣿⠇   ⠘⣧",
    "      ⠹⣿⣧      ⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉          ⣼⣿⠏    ⣠⡿",
    "       ⠘⢿⣷⣄    ⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉         ⢠⣼⡿⠛⠛⠛⠛⠛⠛⠉ ",
    "         ⠻⣿⣦⣄                      ⣀⣴⣿⠟         ",
    "          ⠈⠛⢿⣶⣤⣀                ⣀⣤⣶⡿⠛⠁          ",
    "             ⠉⠻⢿⣿⣶⣤⣤⣀⣀⡀  ⢀⣀⣀⣠⣤⣶⣿⡿⠟⠋             ",
    "                ⠈⠉⠙⠛⠻⠿⠿⠿⠿⠿⠿⠟⠛⠋⠉⠁                ",
  ];
  return lines.map((line) => theme.fg("accent", line));
}
