export type LoginAction =
	| { readonly kind: "import-menu"; readonly label: string }
	| { readonly kind: "import"; readonly source: "pi" | "opencode"; readonly label: string }
	| { readonly kind: "provider"; readonly authType: "oauth" | "api_key"; readonly label: string };

export type LoginActionGroup = {
	readonly title: string;
	readonly actions: readonly LoginAction[];
};
