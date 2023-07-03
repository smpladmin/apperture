import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Spreadsheet from './index';
import {
  getTransientSpreadsheets,
  saveWorkbook,
  updateWorkbook,
} from '@lib/services/workbookService';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '@tests/util';
import { act } from 'react-dom/test-utils';
import { ColumnType } from '@lib/domain/workbook';

jest.mock('@lib/services/workbookService');

describe('spreadsheet', () => {
  let mockedGetTransientSpreadsheet: jest.Mock;
  let mockedSaveWorkbook: jest.Mock;
  let mockedUpdateWorkbook: jest.Mock;
  beforeEach(() => {
    mockedGetTransientSpreadsheet = jest.mocked(getTransientSpreadsheets);
    mockedSaveWorkbook = jest.mocked(saveWorkbook);
    mockedUpdateWorkbook = jest.mocked(updateWorkbook);
    mockedGetTransientSpreadsheet.mockReturnValue({
      status: 200,
      data: {
        headers: [{ name: 'event_name', type: ColumnType.QUERY_HEADER }],
        data: [
          {
            index: 1,
            event_name: 'Video_Seen',
          },
          {
            index: 2,
            event_name: 'Thumbs_Up',
          },
          {
            index: 3,
            event_name: 'WebView_Open',
          },
          {
            index: 4,
            event_name: 'Video_Seen',
          },
          {
            index: 5,
            event_name: 'AppOpen',
          },
          {
            index: 6,
            event_name: '$ae_session',
          },
          {
            index: 7,
            event_name: 'Login',
          },
          {
            index: 8,
            event_name: '$ae_session',
          },
          {
            index: 9,
            event_name: 'Chapter_Click',
          },
          {
            index: 10,
            event_name: 'Topic_Click',
          },
        ],
      },
    });
    mockedSaveWorkbook.mockReturnValue({
      status: 200,
      data: {
        _id: '64349843748',
        datasourceId: '654212033222',
      },
    });
    mockedUpdateWorkbook.mockReturnValue({
      status: 200,
      data: {
        _id: '64349843748',
        datasourceId: '654212033222',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderSpreadsheet = (
    router = createMockRouter({
      pathname: '/analytics/spreadsheet',
      query: { dsId: '654212033222' },
    })
  ) =>
    render(
      <RouterContext.Provider value={router}>
        <Spreadsheet />
      </RouterContext.Provider>
    );

  describe('query modal', () => {
    it('should render query modal', () => {
      renderSpreadsheet();

      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const queryBox = screen.getByRole('textbox');
      // query box should be rendered with default query
      expect(queryBox.textContent).toBe(
        'Select user_id, count() from events group by user_id'
      );
    });

    it('should close query modal if query is executed successfully', async () => {
      renderSpreadsheet();

      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      const queryModal1 = screen.queryByTestId('query-modal');
      expect(queryModal1).not.toBeVisible();
    });

    it('should not close query modal  and show error message, if query is not executed successfully', async () => {
      mockedGetTransientSpreadsheet.mockReturnValue({
        status: 400,
        error: {
          detail: 'Invalid query: Cannot select properties from table',
        },
        data: undefined,
      });

      renderSpreadsheet();
      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      const errorMessage = screen.getByTestId('error-text');
      expect(errorMessage.textContent).toBe(
        'Invalid query: Cannot select properties from table'
      );
    });
  });

  describe('react grid', () => {
    it('should render react grid once user submits', async () => {
      renderSpreadsheet();

      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      const reactGrid = screen.getByTestId('react-grid');
      expect(reactGrid).toBeVisible();
    });
  });

  describe('add new sheet', () => {
    it('should initally render only one sheet name (Sheet 1) and add sheet button', async () => {
      renderSpreadsheet();

      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      const sheetName = screen.getByTestId('sheet-name');
      const addSheetButton = screen.getByTestId('add-sheet');

      expect(sheetName.textContent).toBe('Sheet 1');
      expect(addSheetButton).toBeInTheDocument();
    });

    it('should add a new sheet by opening query modal', async () => {
      renderSpreadsheet();

      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      const addSheetButton = screen.getByTestId('add-sheet');
      fireEvent.click(addSheetButton);

      const newSheetUsingQuery = screen.getByTestId('new-sheet-using-query');
      await act(async () => {
        fireEvent.click(newSheetUsingQuery);
      });

      const queryModalAfterAddingSheet = screen.getByTestId('query-modal');
      expect(queryModalAfterAddingSheet).toBeInTheDocument();
    });

    it('should add a new blank sheet', async () => {
      renderSpreadsheet();

      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      const addSheetButton = screen.getByTestId('add-sheet');
      fireEvent.click(addSheetButton);

      const newSheetUsingQuery = screen.getByTestId('new-sheet');
      await act(async () => {
        fireEvent.click(newSheetUsingQuery);
      });

      // direct grid would render when sheet is created using the option
      const reactGrid = screen.getByTestId('react-grid');
      expect(reactGrid).toBeVisible();

      const sheetNames = screen.getAllByTestId('sheet-name');

      const expectedSheetName = ['Sheet 1', 'Sheet 2'];
      sheetNames.forEach((sheet, i) => {
        expect(sheet.textContent).toEqual(expectedSheetName[i]);
      });
    });
  });

  describe('edit query', () => {
    it('should render query on grid page', async () => {
      renderSpreadsheet();
      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      const queryText = screen.getByTestId('query-text');
    });

    it('should be able to edit query by clicking on edit query button', async () => {
      renderSpreadsheet();
      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      const editQueryButton = screen.getByTestId('edit-query-button');
      fireEvent.click(editQueryButton);

      const queryModal = screen.getByTestId('query-modal');
      expect(queryModal).toBeInTheDocument();

      const queryBox = screen.getByRole('textbox');
      // query box should be prefiiled with query
      expect(queryBox.textContent).toBe(
        'Select user_id, count() from events group by user_id'
      );
    });

    it('should show textbox for nlp sheet and codemirror sql editor for SQL sheet when modal is open using edit query', async () => {
      renderSpreadsheet();
      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // add new sheet using NLP
      const addSheetButton = screen.getByTestId('add-sheet');
      fireEvent.click(addSheetButton);

      const newSheetUsingQuery = screen.getByTestId('new-sheet-using-nlp');
      await act(async () => {
        fireEvent.click(newSheetUsingQuery);
      });

      const nlpTextbox = screen.getByTestId('nlp-textbox');
      expect(nlpTextbox).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // switch to sheet 1 and open query modal
      const sheet1 = screen.getByText('Sheet 1');
      fireEvent.click(sheet1);

      // open query modal
      const editQueryButton = screen.getByTestId('edit-query-button');
      fireEvent.click(editQueryButton);

      // it should see sql editor whose role is textbox and not see nlp-textbox
      const sqlQueryBox = screen.getByRole('textbox');
      expect(sqlQueryBox).toBeInTheDocument();

      const nlpTextboxAfterSwitching = screen.queryByTestId('nlp-textbox');
      expect(nlpTextboxAfterSwitching).not.toBeInTheDocument();
    });
  });

  describe('interactions on column header', () => {
    // skipping this as formula box has been removed.
    it.skip('should open formula box on click on chevron icon on column header', async () => {
      mockedGetTransientSpreadsheet.mockReturnValue({
        status: 200,
        data: {
          headers: [
            { name: 'event_name', type: ColumnType.QUERY_HEADER },
            { name: 'count(event_name)', type: ColumnType.QUERY_HEADER },
          ],
          data: [
            {
              index: 1,
              event_name: 'Video_Seen',
              'count(event_name)': 5,
            },
            {
              index: 2,
              event_name: 'Thumbs_Up',
              'count(event_name)': 15,
            },
            {
              index: 3,
              event_name: 'WebView_Open',
              'count(event_name)': 2,
            },
          ],
        },
      });

      renderSpreadsheet();
      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      const columnHeaderIcon = screen.getAllByTestId('column-header-icon');
      fireEvent.click(columnHeaderIcon[0]);

      const inputFormula = screen.getByTestId('formula-input');
      fireEvent.change(inputFormula, { target: { value: 'B*2' } });
      const doneButton = screen.getByTestId('done-button');

      await act(async () => {
        fireEvent.click(doneButton);
      });

      // expect to see a new column added in C with formula A+2, therefore text content should be 'B A+2'
      const newAddedColumn = screen.getByText('C B*2');
      expect(newAddedColumn).toBeInTheDocument();
    });
  });

  describe('save/update funnel', () => {
    const router = createMockRouter({
      query: { dsId: '654212033222' },
      pathname: '/analytics/workbook/create/',
    });

    it('should be able to save workbook and redirect to edit page', async () => {
      renderSpreadsheet(router);

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/workbook/edit/[workbookId]',
          query: { workbookId: '64349843748', dsId: '654212033222' },
        });
      });
    });

    it('should not be redirected to funnel page if save funnel case fails', async () => {
      mockedSaveWorkbook.mockReturnValue({
        status: 500,
        data: {},
      });

      renderSpreadsheet(router);

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledTimes(0);
      });
    });

    it('should be update workbook if it is on edit page', async () => {
      const router = createMockRouter({
        query: { dsId: '654212033222', workbookId: '64349843748' },
        pathname: '/analytics/workbook/edit',
      });

      renderSpreadsheet(router);

      const submitButton = screen.getByTestId('submit-button');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/workbook/edit/[workbookId]',
          query: { workbookId: '64349843748', dsId: '654212033222' },
        });
      });
    });
  });
});
