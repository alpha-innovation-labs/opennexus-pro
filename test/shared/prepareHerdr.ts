/**
 * Re-export Herdr preparation utilities from @nexus/herdr.
 *
 * This file is kept for backward compatibility — existing test code that
 * imports from "@test/shared" continues to work unchanged.
 */

export type { PreparedHerdr, PrepareHerdrOptions } from "@nexus/herdr";
export {
	closeHerdrWorkspace,
	prepareHerdr,
	promptHerdrAgent,
	startHerdrAgent,
} from "@nexus/herdr";
