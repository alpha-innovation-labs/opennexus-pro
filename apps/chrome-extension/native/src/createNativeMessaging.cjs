const { MAX_NATIVE_MESSAGE_BYTES } = require("./constants.cjs");

/**
 * Creates native messaging stdin/stdout helpers for the Chrome extension protocol.
 *
 * @param {{handleMessage: (message: object) => void, log: (message: string) => void}} options Runtime callbacks.
 * @returns {{writeMessage: (message: object) => void, start: () => void}} Native messaging helpers.
 */
function createNativeMessaging(options) {
  let inputBuffer = Buffer.alloc(0);

  /**
   * Writes one native messaging payload to Chrome.
   *
   * @param {object} msg Message payload.
   */
  function writeMessage(msg) {
    const json = JSON.stringify(msg);
    const len = Buffer.alloc(4);
    len.writeUInt32LE(json.length);
    process.stdout.write(len);
    process.stdout.write(json);
  }

  /** Processes buffered stdin data into complete native messages. */
  function processInput() {
    while (inputBuffer.length >= 4) {
      const len = inputBuffer.readUInt32LE(0);
      if (len > MAX_NATIVE_MESSAGE_BYTES) {
        options.log(`Native message too large: ${len}`);
        inputBuffer = Buffer.alloc(0);
        return;
      }
      if (inputBuffer.length < 4 + len) break;
      const json = inputBuffer.slice(4, 4 + len).toString();
      inputBuffer = inputBuffer.slice(4 + len);
      try {
        options.handleMessage(JSON.parse(json));
      } catch (error) {
        options.log(`Parse error: ${error.message}`);
      }
    }
  }

  /** Starts reading native messages from stdin. */
  function start() {
    process.stdin.on("readable", () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        inputBuffer = Buffer.concat([inputBuffer, chunk]);
        processInput();
      }
    });
  }

  return { start, writeMessage };
}

module.exports = { createNativeMessaging };
