import { fireEvent, render, screen } from '@testing-library/react';
import Spreadsheet from './index';
import { getTransientSpreadsheets } from '@lib/services/spreadsheetService';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '@tests/util';
import { act } from 'react-dom/test-utils';

jest.mock('@lib/services/spreadsheetService');

describe('spreadsheet', () => {
  let mockedGetTransientSpreadsheet: jest.Mock;
  beforeEach(() => {
    mockedGetTransientSpreadsheet = jest.mocked(getTransientSpreadsheets);
    mockedGetTransientSpreadsheet.mockReturnValue({
      status: 200,
      data: {
        headers: ['event_name'],
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
  });

  const renderSpreadsheet = () =>
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: '/analytics/spreadsheet',
          query: { dsId: '654212033222' },
        })}
      >
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
        'Select user_id, event_name from events'
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
        data: {
          detail: 'Invalid query: Cannot select properties from table',
        },
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
      expect(queryText.textContent).toBe(
        'Select user_id, event_name from events'
      );
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
        'Select user_id, event_name from events'
      );
    });
  });

  describe('interactions on column header', () => {
    it('should open formula box on click on chevron icon on column header', async () => {
      mockedGetTransientSpreadsheet.mockReturnValue({
        status: 200,
        data: {
          headers: ['event_name', 'count(event_name)'],
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
});
