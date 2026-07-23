import type { AdapterDefinition } from "../../adapters/shared/types.js";

export interface GatewayState {
  pid: number;
  startedAt: string;
  logPath: string;
  heartbeatAt: string;
  adapters: AdapterDefinition[];
}

export interface GatewayStatus {
  running: boolean;
  pid?: number;
  startedAt?: string;
  heartbeatAt?: string;
  logPath?: string;
  adapters: AdapterDefinition[];
}
