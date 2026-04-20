import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type * as net from "node:net";
import type { AnnotationResult } from "../types.js";

/** Minimal UI surface used by the annotate extension. */
export type AnnotateUiContext = {
  notify?: (message: string, level?: string) => void;
  setStatus?: (key: string, message: string) => void;
};

/** Minimal execution context used by command and tool handlers. */
export type AnnotateExecutionContext = {
  hasUI?: boolean;
  ui?: AnnotateUiContext;
};

/** Pending tool request resolver stored until Chrome returns a result. */
export type AnnotatePendingRequestResolver = (result: AnnotationResult) => void | Promise<void>;

/** Mutable runtime state shared by the annotate extension helpers. */
export type AnnotateRuntimeState = {
  pi: ExtensionAPI;
  browserSocket: net.Socket | null;
  pendingRequests: Map<number, AnnotatePendingRequestResolver>;
  dataBuffer: string;
  authToken: string | null;
  currentCtx: AnnotateExecutionContext | null;
};
