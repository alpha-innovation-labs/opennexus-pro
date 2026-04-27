export type WorkflowStepStatus = "pending" | "running" | "done" | "error";

export interface WorkflowStep {
  id: string;
  label: string;
  status: WorkflowStepStatus;
  agentId?: string;
  updatedAt: number;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowStepStatus;
  createdAt: number;
  updatedAt: number;
  request?: string;
  steps: WorkflowStep[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
}
