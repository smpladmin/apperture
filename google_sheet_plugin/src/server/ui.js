export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Apperture✨')
    .addItem('Authentication', 'openAuthSidebar')
    .addItem('Database', 'openDatabaseSidebar');

  menu.addToUi();
};

export const openDatabaseSidebar = () => {
  const html =
    HtmlService.createHtmlOutputFromFile('database-sidebar').setTitle(
      'Apperture'
    );
  SpreadsheetApp.getUi().showSidebar(html);
};

export const openAuthSidebar = () => {
  const html =
    HtmlService.createHtmlOutputFromFile('auth-sidebar').setTitle('Apperture');
  SpreadsheetApp.getUi().showSidebar(html);
};
