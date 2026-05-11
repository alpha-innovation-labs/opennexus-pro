"use client";

import { useEffect, useState } from "react";
import { ThemeToggleIcon } from "../../../components/theme-toggle-icon/theme-toggle-icon";
import { getNextTheme, type ThemeName } from "./get-next-theme";

/**
 * Returns the current preferred color theme for first client render.
 *
 * @returns The browser-preferred theme.
 */
function getPreferredTheme(): ThemeName {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Applies theme state to the document root and local storage.
 *
 * @param theme Theme value to persist and apply.
 */
function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("nexus-theme", theme);
}

/**
 * Renders the client-side dark/light theme toggle.
 *
 * @returns A button that persists the selected Nexus theme.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("nexus-theme") as ThemeName | null;
    const nextTheme = storedTheme ?? getPreferredTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  /** Handles user requests to switch the color theme. */
  function handleClick(): void {
    const nextTheme = getNextTheme(theme);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      className="theme-toggle flex min-h-10 cursor-pointer items-center border-0 bg-transparent px-3 text-current hover:bg-neutral-100 dark:hover:bg-white/10"
      type="button"
      data-theme-toggle
      aria-label="Toggle color theme"
      aria-pressed={theme === "dark"}
      onClick={handleClick}
    >
      <ThemeToggleIcon />
    </button>
  );
}
