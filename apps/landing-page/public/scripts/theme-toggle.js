/**
 * Returns the next theme value for the toggle button.
 *
 * @param {string} theme Current theme value.
 * @returns {string} Next theme value.
 */
function getNextTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}

/**
 * Applies a theme to the document root and toggle label.
 *
 * @param {string} theme Theme value to apply.
 */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("nexus-theme", theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const label = button.querySelector("[data-theme-toggle-label]");
    if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
    button.setAttribute("aria-pressed", String(theme === "dark"));
  });
}

/**
 * Starts the navbar theme toggle behavior.
 */
function startThemeToggle() {
  const storedTheme = localStorage.getItem("nexus-theme");
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(storedTheme || preferredTheme);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(getNextTheme(document.documentElement.dataset.theme || "light")));
  });
}

startThemeToggle();
