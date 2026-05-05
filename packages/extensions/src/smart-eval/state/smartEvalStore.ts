import type { SmartEvalResult } from "../types.js";

export const smartEvalResultsByTimestamp = new Map<number, SmartEvalResult>();
export const smartEvalExpandedState: { value: boolean } = { value: false };
