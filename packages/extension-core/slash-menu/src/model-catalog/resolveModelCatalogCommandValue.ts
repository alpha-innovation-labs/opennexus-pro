const MODEL_CATALOG_VALUE_PREFIX = "catalog:";

/**
 * Converts a slash-menu model row value into the provider/model command argument.
 *
 * @param value Selected model row value.
 * @returns Provider/model reference accepted by the internal model command.
 */
export function resolveModelCatalogCommandValue(value: string): string {
	return value.startsWith(MODEL_CATALOG_VALUE_PREFIX)
		? value.slice(MODEL_CATALOG_VALUE_PREFIX.length)
		: value;
}
