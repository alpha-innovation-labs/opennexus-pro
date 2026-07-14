import assert from "node:assert/strict";
import test from "node:test";
import { splitWalletCommandArgs } from "../../packages/mini-apps/src/wallet/command/splitWalletCommandArgs.js";

test("splitWalletCommandArgs defaults to one account", () => {
	assert.deepEqual(splitWalletCommandArgs([]), { count: 1, mnemonicArgs: [] });
});

test("splitWalletCommandArgs treats leading number as account count", () => {
	assert.deepEqual(splitWalletCommandArgs(["3", "one", "two"]), { count: 3, mnemonicArgs: ["one", "two"] });
});

test("splitWalletCommandArgs keeps mnemonic words when no count is supplied", () => {
	assert.deepEqual(splitWalletCommandArgs(["one", "two"]), { count: 1, mnemonicArgs: ["one", "two"] });
});
