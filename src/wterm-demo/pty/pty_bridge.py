#!/usr/bin/env python3
"""Bridges a real PTY process over line-delimited JSON on stdio."""

import base64
import json
import os
import pty
import struct
import sys
import termios
import threading
import fcntl


def send_message(message):
    """Writes one JSON message to stdout."""
    sys.stdout.write(json.dumps(message) + "\n")
    sys.stdout.flush()


def set_winsize(fd, cols, rows):
    """Applies terminal dimensions to the PTY master."""
    packed = struct.pack("HHHH", rows, cols, 0, 0)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, packed)


def start_child(shell, command, cwd, cols, rows):
    """Forks the PTY child and execs the requested shell command."""
    pid, master_fd = pty.fork()
    if pid == 0:
        os.chdir(cwd)
        os.environ["TERM"] = "xterm-256color"
        os.environ["FORCE_COLOR"] = "1"
        os.execv(shell, [shell, "-lc", command])
    set_winsize(master_fd, cols, rows)
    return pid, master_fd


def forward_input(master_fd):
    """Reads control messages from stdin and applies them to the PTY."""
    for line in sys.stdin:
        message = json.loads(line)
        if message["type"] == "input":
            data = base64.b64decode(message["data"])
            os.write(master_fd, data)
        elif message["type"] == "resize":
            set_winsize(master_fd, int(message["cols"]), int(message["rows"]))


def main():
    """Runs the PTY bridge until the child exits."""
    shell, command, cwd, cols, rows = sys.argv[1:6]
    pid, master_fd = start_child(shell, command, cwd, int(cols), int(rows))

    input_thread = threading.Thread(target=forward_input, args=(master_fd,), daemon=True)
    input_thread.start()

    while True:
        try:
            chunk = os.read(master_fd, 4096)
        except OSError:
            chunk = b""
        if not chunk:
            break
        send_message({"type": "data", "data": base64.b64encode(chunk).decode("ascii")})

    _, status = os.waitpid(pid, 0)
    exit_code = os.waitstatus_to_exitcode(status)
    send_message({"type": "exit", "code": exit_code})


if __name__ == "__main__":
    main()
