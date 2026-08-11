import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import type {
	AutocompleteItem,
	AutocompleteProvider,
	Component,
} from "@earendil-works/pi-tui";
import type { SlashMenuModal } from "@extensions/slash-menu/SlashMenuModal";
import type { AtModal } from "../AtModal";

export type TriggerKind = "at" | "slash";

export type TriggerState = {
	kind: TriggerKind;
	prefix: string;
};

export type TriggerModalHandle = {
	hide: () => void;
	focus: () => void;
	isFocused: () => boolean;
};

export type ShowOverlay = (
	component: Component,
	options?: unknown,
) => TriggerModalHandle;

export type TriggerEditorDeps = {
	ctx: ExtensionContext;
	uiTheme: ExtensionContext["ui"]["theme"];
	autocompleteProvider?: AutocompleteProvider;
	getThinkingLevel: ExtensionAPI["getThinkingLevel"];
	getSessionName: ExtensionAPI["getSessionName"];
	tui: { requestRender(): void; showOverlay: ShowOverlay };
};

export type TriggerModalState = {
	atModal?: AtModal;
	slashModal?: SlashMenuModal;
	handle?: TriggerModalHandle;
	abort?: AbortController;
};

export type TriggerProviderRefreshArgs = {
	triggerState: TriggerState;
	modalState: TriggerModalState;
	ctx: ExtensionContext;
	uiTheme: ExtensionContext["ui"]["theme"];
	autocompleteProvider?: AutocompleteProvider;
	getThinkingLevel: () => string;
	setThinkingLevel: (value: string) => void;
	getCommands: ExtensionAPI["getCommands"];
	getAllTools: ExtensionAPI["getAllTools"];
	lines: string[];
	cursorLine: number;
	cursorCol: number;
	requestRender: () => void;
	setText: (value: string) => void;
	submitText: (value: string) => void;
	onAutocompletePick: (item: AutocompleteItem) => void;
	showOverlay: ShowOverlay;
};

export type TriggerProvider = {
	routeInput: (
		data: string,
		routeTriggerInput: (kind: TriggerKind, data: string) => boolean,
	) => boolean;
	getModal: (modalState: TriggerModalState) => Component | undefined;
	refresh: (
		args: TriggerProviderRefreshArgs,
	) => Promise<{ autocompletePrefix?: string }>;
};
