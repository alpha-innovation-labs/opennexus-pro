/**
 * Rotates a matrix clockwise.
 *
 * @param matrix Matrix to rotate.
 * @returns Rotated matrix copy.
 */
export function rotateMatrix(matrix: number[][]): number[][] {
	const firstRow = matrix[0];
	if (!firstRow) return [];
	return [
		firstRow
			.map((_, column) => {
				const colValue = matrix.find((row) => row[column] !== undefined);
				return colValue ? colValue[column] : 0;
			})
			.reverse(),
	];
}
