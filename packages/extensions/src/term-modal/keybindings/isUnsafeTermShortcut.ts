/**
 * Returns whether a configured shortcut is unsafe for a global terminal binding.
 *
 * Unsafe keys include plain printable characters that hijack typing, plus
 * legacy control aliases such as ctrl+m that collide with Enter.
 *
 * @param shortcut Configured shortcut id.
 * @returns True when the shortcut should not be registered.
 */
export function isUnsafeTermShortcut(shortcut: string): boolean {
	const normalized = shortcut.toLowerCase();
	if (/^[a-z0-9]$/.test(normalized)) {
		return true;
	}
	if (/^[`\-=\[\]\\;'.,\/!@#$%^&*()_+|~{}:<>?]$/.test(normalized)) {
		return true;
	}
	return ["enter", "return", "tab", "escape", "esc", "backspace", "ctrl+h", "ctrl+i", "ctrl+j", "ctrl+m", "ctrl+["]
		.includes(normalized);
}
