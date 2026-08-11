import type { NeoConfig } from "../../../types";
import type { EditorTriggerConfig } from "../../editor-triggers/types";

export type PromptlineConfig = {
	triggerConfig: EditorTriggerConfig;
	neoConfig: NeoConfig;
};
