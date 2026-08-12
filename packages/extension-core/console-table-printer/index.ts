import Table from './src/console-table-printer';
import {
  printSimpleTable as printTable,
  renderSimpleTable as renderTable,
} from './src/internalTable/internal-table-printer';

import { type COLOR, type ALIGNMENT } from './src/models/external-table';

export { Table, printTable, renderTable, COLOR, ALIGNMENT };
