const DEFAULT_TELEMETRY_ENDPOINT = "https://rybbit.alphainnovationlabs.com/otel/v2/traces";

/**
 * Creates an OTLP attribute value from a primitive.
 *
 * @param {string | number | boolean} value Attribute value.
 * @returns {Record<string, unknown>} OTLP value object.
 */
function createAttributeValue(value) {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { boolValue: value };
  return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
}

/**
 * Converts an attribute object to OTLP attributes.
 *
 * @param {Record<string, string | number | boolean>} attributes Attribute map.
 * @returns {Array<Record<string, unknown>>} OTLP attributes.
 */
function createAttributes(attributes) {
  return Object.entries(attributes).map(([key, value]) => ({ key, value: createAttributeValue(value) }));
}

/**
 * Creates random hexadecimal text.
 *
 * @param {number} bytes Number of random bytes.
 * @returns {string} Random lowercase hex.
 */
function createRandomHex(bytes) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Creates the update/install telemetry payload.
 *
 * @param {string} status Install status.
 * @returns {Record<string, unknown>} OTLP trace payload.
 */
function createPayload(status) {
  const time = String(BigInt(Date.now()) * 1_000_000n);
  return {
    resourceSpans: [{
      resource: { attributes: createAttributes({ "service.name": "nexus", "service.version": process.env.npm_package_version ?? "unknown" }) },
      scopeSpans: [{
        scope: { name: "nexus.telemetry" },
        spans: [{
          traceId: createRandomHex(16),
          spanId: createRandomHex(8),
          name: "update.install.result",
          kind: 1,
          startTimeUnixNano: time,
          endTimeUnixNano: time,
          attributes: createAttributes({ "event.name": "update.install.result", "update.status": status }),
          status: { code: 1 },
        }],
      }],
    }],
  };
}

/**
 * Sends update/install result telemetry and never fails the caller.
 *
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const status = process.argv[2] === "failure" ? "failure" : "success";
    await fetch(process.env.NEXUS_TELEMETRY_ENDPOINT || DEFAULT_TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createPayload(status)),
    });
  } catch {
    // Telemetry must not affect release/install behavior.
  }
}

await main();
