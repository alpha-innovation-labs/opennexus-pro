export {};

declare global {
	interface Window {
		AsciinemaPlayer?: {
			create: (
				source: string,
				target: HTMLElement,
				options: Record<string, unknown>,
			) => unknown;
		};
	}
}
