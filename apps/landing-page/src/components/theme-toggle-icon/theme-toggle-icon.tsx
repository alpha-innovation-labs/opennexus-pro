/**
 * Renders the inline icon used by the color theme toggle button.
 *
 * @returns The theme toggle SVG icon.
 */
export function ThemeToggleIcon() {
	return (
		<svg
			className="theme-toggle-icon h-6 w-6"
			viewBox="0 0 24 24"
			aria-hidden="true"
			focusable="false"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				cx="12"
				cy="12"
				r="9"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.4"
			/>
			<path
				d="M12 4v16"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.4"
				strokeLinecap="round"
			/>
			<path
				d="M17.5 6.5 8 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.4"
				strokeLinecap="round"
			/>
			<path
				d="M18.5 11.5 13 17"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.4"
				strokeLinecap="round"
			/>
		</svg>
	);
}
