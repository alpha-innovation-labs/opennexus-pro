/**
 * Rotates a matrix clockwise.
 *
 * @param matrix Matrix to rotate.
 * @returns Rotated matrix copy.
 */
export function rotateMatrix(matrix: number[][]): number[][] {
	return matrix[0]!.map((_, column) => matrix.map((row) => row[column]!).reverse());
}
