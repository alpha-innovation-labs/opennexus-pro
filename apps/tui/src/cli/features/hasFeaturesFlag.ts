const DISABLE_FEATURES_FLAG = "--disable-features";
const ENABLE_FEATURES_FLAG = "--enable-features";
const MINIMAL_FLAGS = new Set(["--minimal", "-m"]);

/**
 * Reports whether argv requests feature overrides.
 *
 * @param argv Raw CLI args.
 * @returns True when --disable-features or --enable-features is present.
 */
export function hasFeaturesOverrideFlag(argv: readonly string[]): boolean {
	return argv.includes(DISABLE_FEATURES_FLAG) || argv.includes(ENABLE_FEATURES_FLAG);
}

/**
 * Extracts the feature IDs from --disable-features.
 *
 * @param argv Raw CLI args.
 * @returns Array of feature IDs to disable, or empty array.
 */
export function readDisabledFeatures(argv: readonly string[]): string[] {
	const result: string[] = [];
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === DISABLE_FEATURES_FLAG && index + 1 < argv.length) {
			const raw = argv[index + 1];
			if (raw) {
				result.push(...raw.split(",").map((id) => id.trim()).filter(Boolean));
			}
			index += 1;
		}
	}
	return result;
}

/**
 * Extracts the feature IDs from --enable-features.
 *
 * @param argv Raw CLI args.
 * @returns Array of feature IDs to force-enable, or empty array.
 */
export function readEnabledFeatures(argv: readonly string[]): string[] {
	const result: string[] = [];
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === ENABLE_FEATURES_FLAG && index + 1 < argv.length) {
			const raw = argv[index + 1];
			if (raw) {
				result.push(...raw.split(",").map((id) => id.trim()).filter(Boolean));
			}
			index += 1;
		}
	}
	return result;
}

/**
 * Strips --disable-features and --enable-flags from argv.
 *
 * @param argv Raw CLI args.
 * @returns Args with feature override flags removed.
 */
export function stripFeatureFlags(argv: readonly string[]): string[] {
	const result: string[] = [];
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === DISABLE_FEATURES_FLAG || arg === ENABLE_FEATURES_FLAG) {
			index += 1; // skip the flag and its value
			continue;
		}
		if (MINIMAL_FLAGS.has(arg)) {
			continue; // skip minimal flags
		}
		result.push(arg);
	}
	return result;
}
