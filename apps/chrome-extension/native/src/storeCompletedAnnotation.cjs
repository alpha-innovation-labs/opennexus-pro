const { ANNOTATIONS_DAEMON_URL } = require("./constants.cjs");

/**
 * Stores completed annotations in the Nexus annotations daemon.
 *
 * @param {object} msg Native message from the Chrome extension.
 * @param {(message: string) => void} log Native host logger.
 */
function storeCompletedAnnotation(msg, log) {
  if (msg?.type !== "ANNOTATIONS_COMPLETE" || !msg.result?.success) return;
  fetch(ANNOTATIONS_DAEMON_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(msg.result),
  }).then((response) => {
    if (!response.ok) log(`Annotation daemon rejected capture: ${response.status}`);
  }).catch((error) => {
    log(`Annotation daemon capture failed: ${error.message}`);
  });
}

module.exports = { storeCompletedAnnotation };
