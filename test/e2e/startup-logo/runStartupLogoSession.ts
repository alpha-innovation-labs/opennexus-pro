import { execFile, type ExecFileException } from "node:child_process";

const PYTHON_STARTUP_CAPTURE = [
	"import os, pty, select, signal, subprocess, sys, time",
	"master, slave = pty.openpty()",
	"proc = subprocess.Popen([\"/bin/bash\", \"-lc\", \"./node_modules/.bin/tsx src/index.ts\"], cwd=os.getcwd(), env=os.environ.copy(), stdin=slave, stdout=slave, stderr=slave, close_fds=True)",
	"os.close(slave)",
	"deadline = time.time() + (int(os.environ.get(\"STARTUP_LOGO_TIMEOUT_MS\", \"8000\")) / 1000.0)",
	"chunks = []",
	"while time.time() < deadline:",
	"    ready, _, _ = select.select([master], [], [], 0.1)",
	"    if master in ready:",
	"        try:",
	"            data = os.read(master, 65536)",
	"        except OSError:",
	"            break",
	"        if not data:",
	"            break",
	"        chunks.append(data)",
	"try:",
	"    proc.send_signal(signal.SIGINT)",
	"except ProcessLookupError:",
	"    pass",
	"drain_deadline = time.time() + 2.0",
	"while time.time() < drain_deadline:",
	"    if proc.poll() is not None:",
	"        break",
	"    ready, _, _ = select.select([master], [], [], 0.1)",
	"    if master in ready:",
	"        try:",
	"            data = os.read(master, 65536)",
	"        except OSError:",
	"            break",
	"        if not data:",
	"            break",
	"        chunks.append(data)",
	"if proc.poll() is None:",
	"    proc.kill()",
	"try:",
	"    while True:",
	"        data = os.read(master, 65536)",
	"        if not data:",
	"            break",
	"        chunks.append(data)",
	"except OSError:",
	"    pass",
	"os.close(master)",
	"sys.stdout.buffer.write(b''.join(chunks))",
].join("\n");

/**
 * Runs the app inside a Python-managed PTY and returns captured startup output.
 *
 * @param cwd Project root.
 * @param env Child environment.
 * @param columns Terminal width.
 * @param rows Terminal height.
 * @param timeoutMs Max runtime before forced termination.
 * @returns Captured terminal output.
 */
export async function runStartupLogoSession(
	cwd: string,
	env: NodeJS.ProcessEnv,
	columns: number,
	rows: number,
	timeoutMs: number,
): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		execFile(
			"python3",
			["-c", PYTHON_STARTUP_CAPTURE],
			{
				cwd,
				env: {
					...env,
					TERM: "xterm-256color",
					COLUMNS: String(columns),
					LINES: String(rows),
					STARTUP_LOGO_TIMEOUT_MS: String(timeoutMs),
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
