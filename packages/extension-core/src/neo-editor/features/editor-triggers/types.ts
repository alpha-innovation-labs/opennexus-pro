export type EditorTriggerMatchMode = "exact" | "startsWith" | "includes";

export type EditorTriggerAction = {
	type: "submit";
};

export type EditorTriggerRule = {
	match: {
		text: string;
		mode?: EditorTriggerMatchMode;
	};
	action: EditorTriggerAction;
};

export type EditorTriggerConfig = {
	rules: EditorTriggerRule[];
};
