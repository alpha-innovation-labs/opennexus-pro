export type AdapterId = "discord" | "telegram";

export type AdapterStage = "planned" | "polling";

export interface AdapterDefinition {
  id: AdapterId;
  label: string;
  stage: AdapterStage;
}
