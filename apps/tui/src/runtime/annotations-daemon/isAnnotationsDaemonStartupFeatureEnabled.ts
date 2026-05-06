import { isRuntimeFeatureAvailable } from "@nexus/feature-flags/isRuntimeFeatureAvailable.js";
import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { readFeatureFlagsConfig } from "@nexus/feature-flags/readFeatureFlagsConfig.js";

/**
 * Reports whether automatic annotations daemon startup is enabled by feature flags.
 *
 * @returns True when both annotate UI/tooling and annotation daemon flags are available.
 */
export function isAnnotationsDaemonStartupFeatureEnabled(): boolean {
	try {
		const config = applyUserExtensionConfig(readFeatureFlagsConfig());
		return config.extensions.annotate?.enabled === true && config.other?.annotation?.enabled === true;
	} catch {
		const config = applyUserExtensionConfig(getBundledFeatureFlagsConfig());
		return isRuntimeFeatureAvailable(config.extensions.annotate) && isRuntimeFeatureAvailable(config.other?.annotation);
	}
}
