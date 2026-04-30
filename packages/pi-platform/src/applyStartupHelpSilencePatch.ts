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
	initialize?: () => Promise<void>;
};

type InteractiveModeClass = {
	__nexusStartupHelpSilenced__?: boolean;
	prototype: {
		initialize: (this: InteractiveModeInstance) => Promise<void>;
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
		import("../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/interactive-mode.js"),
		import("../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js"),
	]);
	const InteractiveMode = interactiveModule.InteractiveMode as InteractiveModeClass;
	const SettingsManager = settingsModule.SettingsManager as SettingsManagerClass;
	if (InteractiveMode.__nexusStartupHelpSilenced__) return;

	SettingsManager.prototype.getQuietStartup = function getQuietStartupForNexusStartupHelp(): boolean {
		return true;
	};
	SettingsManager.__nexusStartupHelpSilenced__ = true;

	const originalInitialize = InteractiveMode.prototype.initialize;
	InteractiveMode.prototype.initialize = async function initializeWithoutPiStartupHelp(this: InteractiveModeInstance): Promise<void> {
		const settingsManager = this.settingsManager;
		const originalGetQuietStartup = settingsManager?.getQuietStartup;
		const originalVerbose = this.options?.verbose;
		if (settingsManager && originalGetQuietStartup) {
			settingsManager.getQuietStartup = () => true;
		}
		if (this.options) {
			this.options.verbose = false;
		}
		try {
			await originalInitialize.call(this);
		} finally {
			if (settingsManager && originalGetQuietStartup) {
				settingsManager.getQuietStartup = originalGetQuietStartup;
			}
			if (this.options) {
				this.options.verbose = originalVerbose;
			}
		}
	};

	InteractiveMode.__nexusStartupHelpSilenced__ = true;
}
