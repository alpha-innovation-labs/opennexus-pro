export interface RegisteredTool {
  name: string;
  execute: (...args: any[]) => Promise<{ content: Array<{ type: string; text: string }>; details?: Record<string, unknown> }>;
}

export interface TestContext {
  cwd: string;
  hasUI: boolean;
  ui: {
    notify: (message: string, level: string) => void;
  };
}
