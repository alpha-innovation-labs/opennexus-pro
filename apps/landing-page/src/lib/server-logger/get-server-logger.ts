import pino from "pino";

/**
 * Creates the project-approved server logger for future server-side diagnostics.
 *
 * @returns A pino logger scoped to the landing page app.
 */
export function getServerLogger(): pino.Logger {
  return pino({ name: "landing-page" });
}
