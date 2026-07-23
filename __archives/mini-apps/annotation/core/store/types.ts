import type { AnnotationResult } from "@nexus/mini-apps/annotate/types.js";

export type StoredAnnotationStatus = "pending" | "claimed" | "resolved";

export interface StoredAnnotation {
  id: string;
  status: StoredAnnotationStatus;
  result: AnnotationResult;
  createdAt: string;
  updatedAt: string;
  claimedBy?: string;
  claimedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AnnotationStore {
  annotations: StoredAnnotation[];
}
