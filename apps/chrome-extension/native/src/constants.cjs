const SOCKET_PATH = "/tmp/pi-annotate.sock";
const TOKEN_PATH = "/tmp/pi-annotate.token";
const LOG_FILE = "/tmp/pi-annotate-host.log";
const MAX_NATIVE_MESSAGE_BYTES = 32 * 1024 * 1024;
const MAX_SOCKET_BUFFER = 32 * 1024 * 1024;
const MAX_LOG_BYTES = 5 * 1024 * 1024;
const ANNOTATIONS_DAEMON_URL = "http://127.0.0.1:47321/annotations";

module.exports = {
  ANNOTATIONS_DAEMON_URL,
  LOG_FILE,
  MAX_LOG_BYTES,
  MAX_NATIVE_MESSAGE_BYTES,
  MAX_SOCKET_BUFFER,
  SOCKET_PATH,
  TOKEN_PATH,
};
