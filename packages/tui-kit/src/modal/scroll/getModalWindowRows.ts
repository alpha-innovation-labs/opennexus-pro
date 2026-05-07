/**
 * Resolves the terminal row count available to a modal.
 *
 * @param fallbackRows Rows to use when stdout does not expose terminal height.
 * @returns Positive terminal row count.
 */
export function getModalWindowRows(fallbackRows: number): number {
  const stdoutRows = process.stdout.rows;
  if (typeof stdoutRows === "number" && Number.isFinite(stdoutRows) && stdoutRows > 0) return Math.floor(stdoutRows);
  return Math.max(1, Math.floor(fallbackRows));
}
