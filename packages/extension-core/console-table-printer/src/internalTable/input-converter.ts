import type { ALIGNMENT, COLOR } from '../models/common';
import type {
  ColumnOptionsRaw,
  ComputedColumn,
  DefaultColumnOptions,
} from '../models/external-table';
import type { Column } from '../models/internal-table';
import { DEFAULT_ROW_ALIGNMENT } from '../utils/table-constants';

export const objIfExists = (key: string, val: unknown) => {
  if (!val) {
    return {};
  }

  return {
    [key]: val,
  };
};

export const rawColumnToInternalColumn = (
  column: ColumnOptionsRaw | ComputedColumn,
  defaultColumnStyles?: DefaultColumnOptions
): Column => ({
  name: column.name,
  title: column.title ?? column.name,
  ...objIfExists(
    'color',
    (column.color || defaultColumnStyles?.color) as COLOR
  ),
  ...objIfExists(
    'maxLen',
    (column.maxLen || defaultColumnStyles?.maxLen) as number
  ),
  ...objIfExists(
    'minLen',
    (column.minLen || defaultColumnStyles?.minLen) as number
  ),
  alignment: (column.alignment ||
    defaultColumnStyles?.alignment ||
    DEFAULT_ROW_ALIGNMENT) as ALIGNMENT,
  transform: column.transform,
});
