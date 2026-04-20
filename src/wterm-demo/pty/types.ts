export interface DemoPty {
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
  onData: (listener: (data: string) => void) => () => void;
  onExit: (listener: (code: number) => void) => () => void;
}
