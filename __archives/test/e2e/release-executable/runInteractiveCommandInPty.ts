import { execFile, type ExecFileException } from "node:child_process";

const PYTHON_PTY_CAPTURE = [
  "import os, pty, select, signal, subprocess, sys, time",
  "master, slave = pty.openpty()",
  "proc = subprocess.Popen(['/bin/bash', '-lc', os.environ['RELEASE_PTY_COMMAND']], cwd=os.getcwd(), env=os.environ.copy(), stdin=slave, stdout=slave, stderr=slave, close_fds=True)",
  "os.close(slave)",
  "chunks = []",
  "deadline = time.time() + (int(os.environ['RELEASE_PTY_STARTUP_DELAY_MS']) / 1000.0)",
  "while time.time() < deadline:",
  "    ready, _, _ = select.select([master], [], [], 0.1)",
  "    if master in ready:",
  "        try: data = os.read(master, 65536)",
  "        except OSError: break",
  "        if not data: break",
  "        chunks.append(data)",
  "os.write(master, os.environ['RELEASE_PTY_INPUT'].encode('utf-8').decode('unicode_escape').encode('latin1'))",
  "deadline = time.time() + (int(os.environ['RELEASE_PTY_AFTER_INPUT_DELAY_MS']) / 1000.0)",
  "while time.time() < deadline:",
  "    ready, _, _ = select.select([master], [], [], 0.1)",
  "    if master in ready:",
  "        try: data = os.read(master, 65536)",
  "        except OSError: break",
  "        if not data: break",
  "        chunks.append(data)",
  "try: proc.send_signal(signal.SIGINT)",
  "except ProcessLookupError: pass",
  "deadline = time.time() + 2.0",
  "while time.time() < deadline:",
  "    if proc.poll() is not None: break",
  "    ready, _, _ = select.select([master], [], [], 0.1)",
  "    if master in ready:",
  "        try: data = os.read(master, 65536)",
  "        except OSError: break",
  "        if not data: break",
  "        chunks.append(data)",
  "if proc.poll() is None: proc.kill()",
  "sys.stdout.buffer.write(b''.join(chunks))",
].join("\n");

export interface RunInteractiveCommandInPtyOptions {
  command: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
  startupDelayMs: number;
  input: string;
  afterInputDelayMs: number;
  cols?: number;
  rows?: number;
}

/**
 * Runs one interactive command in a PTY, sends input, and captures its terminal output.
 *
 * @param options PTY run options.
 * @returns Captured PTY output.
 */
export async function runInteractiveCommandInPty(options: RunInteractiveCommandInPtyOptions): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    execFile(
      "python3",
      ["-c", PYTHON_PTY_CAPTURE],
      {
        cwd: options.cwd,
        env: {
          ...options.env,
          TERM: "xterm-256color",
          COLUMNS: String(options.cols ?? 100),
          LINES: String(options.rows ?? 30),
          RELEASE_PTY_COMMAND: options.command,
          RELEASE_PTY_STARTUP_DELAY_MS: String(options.startupDelayMs),
          RELEASE_PTY_INPUT: options.input.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u0016/g, "\\x16"),
          RELEASE_PTY_AFTER_INPUT_DELAY_MS: String(options.afterInputDelayMs),
        },
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout}${stderr}`;
        if (!error) {
          resolve(output);
          return;
        }
        const execError = error as ExecFileException;
        if (execError.killed || execError.signal) {
          resolve(output);
          return;
        }
        reject(error);
      },
    );
  });
}
