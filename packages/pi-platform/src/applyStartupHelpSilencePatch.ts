type SettingsManagerClass = {
	__nexusStartupHelpSilenced__?: boolean;
	prototype: {
		getQuietStartup: () => boolean;
	};
};

type InteractiveModeInstance = {
	options?: {
		verbose?: boolean;
	};
	settingsManager?: {
		getQuietStartup?: () => boolean;
	};
	init?: () => Promise<void>;
};

type InteractiveModeClass = {
	__nexusStartupHelpSilenced__?: boolean;
	prototype: {
		init: (this: InteractiveModeInstance) => Promise<void>;
	};
};

/**
 * Silences Pi's built-in startup help header while interactive mode initializes.
 *
 * Nexus renders its own startup UX, so upstream Pi help and branding must not flash
 * before extensions can replace the header.
 */
export async function applyStartupHelpSilencePatch(): Promise<void> {
	const [interactiveModule, settingsModule] = await Promise.all([
		import("@earendil-works/pi-coding-agent"),
		import("@earendil-works/pi-coding-agent"),
	]);
	const InteractiveMode =
		interactiveModule.InteractiveMode as unknown as InteractiveModeClass;
	const SettingsManager =
		settingsModule.SettingsManager as SettingsManagerClass;
	if (InteractiveMode.__nexusStartupHelpSilenced__) return;

	// Force quietStartup on every SettingsManager instance by overriding
	// the prototype getter — the class method reads from this prototype.
	// (The instance method reads this.settings.quietStartup; we set a
	// default on the prototype so the ?? false fallback yields true.)
	Object.defineProperty(SettingsManager.prototype, "getQuietStartup", {
		value: function getQuietStartupForNexus(): boolean {
			return true;
		},
		writable: true,
		configurable: true,
	});
	SettingsManager.__nexusStartupHelpSilenced__ = true;

	const originalInit = InteractiveMode.prototype.init;
	if (originalInit) {
		InteractiveMode.prototype.init =
			async function initWithoutPiStartupHelp(
				this: InteractiveModeInstance,
			): Promise<void> {
				const settingsManager = this.settingsManager;
				const originalGetQuietStartup = settingsManager?.getQuietStartup;
				const originalVerbose = this.options?.verbose;
				if (settingsManager) {
					settingsManager.getQuietStartup = () => true;
				}
				if (this.options) {
					this.options.verbose = false;
				}
				try {
					await originalInit.call(this);
				} finally {
					if (settingsManager && originalGetQuietStartup) {
						settingsManager.getQuietStartup = originalGetQuietStartup;
					}
					if (this.options) {
						this.options.verbose = originalVerbose;
					}
				}
			};
	}

	InteractiveMode.__nexusStartupHelpSilenced__ = true;
}
