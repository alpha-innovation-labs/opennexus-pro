import { atTriggerProvider } from "./providers/atTriggerProvider";
import { slashTriggerProvider } from "./providers/slashTriggerProvider";
import type { TriggerKind, TriggerProvider } from "./types";

const triggerProviders: Record<TriggerKind, TriggerProvider> = {
	at: atTriggerProvider,
	slash: slashTriggerProvider,
};

/**
 * Returns the provider for one trigger kind.
 *
 * @param kind Trigger kind.
 * @returns Trigger provider.
 */
export function getTriggerProvider(kind: TriggerKind): TriggerProvider {
	return triggerProviders[kind];
}
