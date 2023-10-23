export const getLoggedInUserEmail = () => {
  const email = Session.getActiveUser().getEmail();
  return email;
};

export const showAlert = (message: string) => {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Apperture',
    message + ' - ' + getLoggedInUserEmail(),
    ui.ButtonSet.OK
  );
};

export const getActiveCell = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const sheetName = sheet.getName();

  const activeCell = sheet.getActiveCell();
  const activeCellRow = activeCell.getRow();
  const activeCellColumn = activeCell.getColumn();

  return { sheetName, activeCellRow, activeCellColumn };
};

export const getSpreadsheetId = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetId = sheet.getId();
  return sheetId;
};

export const populateDataInSheet = (
  rowIndex: number,
  columnIndex: number,
  headers: string[],
  data: Array<Array<string>>
) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rowData = [headers, ...data];

  sheet
    .getRange(rowIndex, columnIndex, rowData.length, rowData[0].length)
    .setValues(rowData);

  // highlight header color
  sheet
    .getRange(rowIndex, columnIndex, 1, rowData[0].length)
    .setBackground('#228b22')
    .setFontColor('#ffffff');
};

export const fetchConnections = (apiKey: string) => {
  const apiUrl =
    'https://6377-2409-40d7-b-f584-ed-a5fe-d90d-1ee.ngrok-free.app/apperture/google-sheets/connections';
  const userEmail = getLoggedInUserEmail();
  const options = {
    headers: {
      'api-key': apiKey,
      'user-email': userEmail,
      'ngrok-skip-browser-warning': '69420',
    },
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const status = response.getResponseCode();
    console.log({ status });
    if (status === 200) {
      const data = response.getContentText();
      return JSON.parse(data); // getContentText returns a response of type string
    }
    return [];
  } catch (error) {
    Logger.log('error' + error);
    return [];
  }
};

export const getSavedWorkbooks = (apiKey: string) => {
  const apiUrl =
    'https://6377-2409-40d7-b-f584-ed-a5fe-d90d-1ee.ngrok-free.app/apperture/google-sheets/workbooks';
  const userEmail = getLoggedInUserEmail();
  const options = {
    headers: {
      'api-key': apiKey,
      'user-email': userEmail,
      'ngrok-skip-browser-warning': '69420',
    },
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const status = response.getResponseCode();

    if (status === 200) {
      const data = response.getContentText(); // getContentText returns a response of type string
      const parsedData = JSON.parse(data);
      return parsedData;
    }

    return [];
  } catch (error) {
    Logger.log('error' + error);
    return [];
  }
};

type SheetReference = {
  rowIndex: number;
  columnIndex: number;
  sheetName: string;
};

export const executeQuery = (
  apiKey: string,
  query: string,
  isSql: boolean,
  selectedTableData: any,
  sheetReference: SheetReference
) => {
  const apiUrl =
    'https://6377-2409-40d7-b-f584-ed-a5fe-d90d-1ee.ngrok-free.app/apperture/google-sheets/transient';
  const userEmail = getLoggedInUserEmail();

  const payload = {
    query: query,
    isSql,
    tableData: selectedTableData,
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'api-key': apiKey,
      'user-email': userEmail,
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const status = response.getResponseCode();
    if (status === 200) {
      const data = response.getBlob().getDataAsString();
      const parsedData = JSON.parse(data);
      populateDataInSheet(
        sheetReference?.rowIndex || 1,
        sheetReference?.columnIndex || 1,
        parsedData?.headers,
        parsedData?.data
      );
      return parsedData;
    }

    return {
      query: '',
      data: [],
      headers: [],
    };
  } catch (error) {
    console.log('in error');
    Logger.log('error' + error);
    return {
      query: '',
      data: [],
      headers: [],
    };
  }
};

export const saveSheetQuery = (
  apiKey: string,
  name: string,
  query: String,
  messages: any[],
  sheetReference: SheetReference
) => {
  const apiUrl =
    'https://6377-2409-40d7-b-f584-ed-a5fe-d90d-1ee.ngrok-free.app/apperture/google-sheets/sheet-query';
  const userEmail = getLoggedInUserEmail();
  const spreadsheetId = getSpreadsheetId();

  const payload = {
    name,
    spreadsheetId,
    query,
    chats: messages,
    sheetReference,
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'api-key': apiKey,
      'user-email': userEmail,
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const data = response.getBlob().getDataAsString();
    const parsedData = JSON.parse(data);
    Logger.log('data' + data);
    return parsedData;
  } catch (error) {
    Logger.log('error' + error);
    return 'Error fetching data from API: ' + error.toString();
  }
};

export const updateSheetQuery = (
  apiKey: string,
  queryId: string,
  name: string,
  query: string,
  messages: any[],
  sheetReference: SheetReference
) => {
  const apiUrl = `https://6377-2409-40d7-b-f584-ed-a5fe-d90d-1ee.ngrok-free.app/apperture/google-sheets/sheet-query/${queryId}`;
  const userEmail = getLoggedInUserEmail();
  const spreadsheetId = getSpreadsheetId();

  const payload = {
    name,
    spreadsheetId,
    query,
    chats: messages,
    sheetReference,
  };

  const options = {
    method: 'put',
    contentType: 'application/json',
    headers: {
      'api-key': apiKey,
      'user-email': userEmail,
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const data = response.getBlob().getDataAsString();
    const parsedData = JSON.parse(data);
    Logger.log('data' + data);
    return parsedData;
  } catch (error) {
    Logger.log('error' + error);
    return 'Error fetching data from API: ' + error.toString();
  }
};

export const getSheetQueries = (apiKey: string) => {
  const sheetId = getSpreadsheetId();
  const apiUrl = `https://6377-2409-40d7-b-f584-ed-a5fe-d90d-1ee.ngrok-free.app/apperture/google-sheets/sheet-query/${sheetId}`;
  const userEmail = getLoggedInUserEmail();
  const options = {
    headers: {
      'api-key': apiKey,
      'user-email': userEmail,
      'ngrok-skip-browser-warning': '69420',
    },
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const status = response.getResponseCode();
    if (status === 200) {
      const data = response.getContentText();
      return JSON.parse(data); // getContentText returns a response of type string
    }
    return [];
  } catch (error) {
    Logger.log('error' + error);
    return [];
  }
};
