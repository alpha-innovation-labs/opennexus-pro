/** Captured result from an observations recreate CLI invocation. */
export type ObservationRecreateCliResult = {
	/** Process exit code returned by the nested Nexus command. */
	exitCode: number;
	/** Captured stdout text. */
	stdout: string;
	/** Captured stderr text. */
	stderr: string;
};
