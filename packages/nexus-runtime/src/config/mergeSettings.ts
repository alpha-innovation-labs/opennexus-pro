export type SettingsRecord = Record<string, unknown>;

/**
 * Deep-merges settings objects, giving override values precedence.
 *
 * @param base Base settings object.
 * @param overrides Override settings object.
 * @returns Merged settings object.
 */
export function mergeSettings(
	base: SettingsRecord,
	overrides: SettingsRecord,
): SettingsRecord {
	const result: SettingsRecord = { ...base };

	for (const [key, overrideValue] of Object.entries(overrides)) {
		const baseValue = result[key];

		if (
			typeof overrideValue === "object" &&
			overrideValue !== null &&
			!Array.isArray(overrideValue) &&
			typeof baseValue === "object" &&
			baseValue !== null &&
			!Array.isArray(baseValue)
		) {
			result[key] = mergeSettings(
				baseValue as SettingsRecord,
				overrideValue as SettingsRecord,
			);
			continue;
		}

		result[key] = overrideValue;
	}

	return result;
}
