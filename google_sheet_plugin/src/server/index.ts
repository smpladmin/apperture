import { onOpen, openAuthSidebar, openDatabaseSidebar } from './ui';

import {
  showAlert,
  getLoggedInUserEmail,
  getActiveCell,
  fetchConnections,
  executeQuery,
  getSavedWorkbooks,
  getSpreadsheetId,
  populateDataInSheet,
  saveSheetQuery,
  updateSheetQuery,
  getSheetQueries,
} from './sheets';

// Public functions must be exported as named exports
export {
  onOpen,
  openAuthSidebar,
  openDatabaseSidebar,
  showAlert,
  getLoggedInUserEmail,
  getActiveCell,
  fetchConnections,
  executeQuery,
  getSavedWorkbooks,
  getSpreadsheetId,
  populateDataInSheet,
  saveSheetQuery,
  updateSheetQuery,
  getSheetQueries,
};
