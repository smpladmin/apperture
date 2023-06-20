import { Provider } from '@lib/domain/provider';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMockRouter } from '@tests/util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { getSavedWorkbooksForDatasourceId } from '@lib/services/workbookService';
import SavedSheets from '.';

jest.mock('@lib/services/workbookService');

describe('list saved sheets', () => {
  let mockedGetSavedWorkbooksForDatasourceId: jest.Mock;

  const savedWorkbooks = [
    {
      _id: '64831b976f4063147966afdd',
      createdAt: '2023-06-09T12:31:19.776000',
      updatedAt: '2023-06-09T12:31:19.780000',
      datasourceId: '63e236e89343884e21e0a07c',
      appId: '63e236d19343884e21e0a07a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'Save 1',
      spreadsheets: [
        {
          name: 'Sheet 1',
          headers: [
            {
              name: 'user_id',
              type: 'QUERY_HEADER',
            },
            {
              name: 'count()',
              type: 'QUERY_HEADER',
            },
          ],
          is_sql: true,
          query: 'Select user_id, count(*) from events group by user_id',
        },
        {
          name: 'Sheet 2',
          headers: [
            {
              name: 'user_id',
              type: 'QUERY_HEADER',
            },
            {
              name: 'count()',
              type: 'QUERY_HEADER',
            },
          ],
          is_sql: false,
          query: 'get all the user_id and their count',
        },
        {
          name: 'Sheet 3',
          headers: [],
          is_sql: true,
          query: '',
        },
        {
          name: 'Sheet 4',
          headers: [
            {
              name: 'user_id',
              type: 'QUERY_HEADER',
            },
            {
              name: 'event_name',
              type: 'QUERY_HEADER',
            },
          ],
          is_sql: true,
          query: 'Select user_id, event_name from events',
        },
      ],
      enabled: true,
      user: {
        id: '6374b74e9b36ecf7e0b4f9e4',
        firstName: 'Anish',
        lastName: 'Kaushal',
        email: 'anish@parallelhq.com',
        picture:
          'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
        slackChannel: 'bug-reports',
      },
    },
    {
      _id: '64831c166f4063147966afde',
      createdAt: '2023-06-09T12:33:26.514000',
      updatedAt: '2023-06-09T12:33:26.515000',
      datasourceId: '63e236e89343884e21e0a07c',
      appId: '63e236d19343884e21e0a07a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'SAVE 2',
      spreadsheets: [
        {
          name: 'Sheet 1',
          headers: [
            {
              name: 'user_id',
              type: 'QUERY_HEADER',
            },
            {
              name: 'event_name',
              type: 'QUERY_HEADER',
            },
          ],
          is_sql: true,
          query: 'Select user_id, event_name from events',
        },
      ],
      enabled: true,
      user: {
        id: '6374b74e9b36ecf7e0b4f9e4',
        firstName: 'Anish',
        lastName: 'Kaushal',
        email: 'anish@parallelhq.com',
        picture:
          'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
        slackChannel: 'bug-reports',
      },
    },
  ];

  const renderSavedWorkbooks = async (
    router = createMockRouter({
      pathname: '/analytics/workbook/list',
      query: { dsId: '63d0a7bfc636cee15d81f579' },
    })
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <SavedSheets provider={Provider.MIXPANEL} />
        </RouterContext.Provider>
      );
    });
  };

  beforeEach(() => {
    mockedGetSavedWorkbooksForDatasourceId = jest.mocked(
      getSavedWorkbooksForDatasourceId
    );
    mockedGetSavedWorkbooksForDatasourceId.mockReturnValue(savedWorkbooks);
  });

  it('should be able to navigate to create page on clicking new sheet button', async () => {
    const router = createMockRouter({
      pathname: '/analytics/workbook/list',
      query: { dsId: '63d0a7bfc636cee15d81f579' },
    });

    await renderSavedWorkbooks(router);

    const newSheetButton = screen.getByTestId('new-sheet');
    fireEvent.click(newSheetButton);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/analytics/workbook/create/[dsId]',
      query: { dsId: '63d0a7bfc636cee15d81f579' },
    });
  });

  it('should render 2 saved workbook in listing table', async () => {
    await renderSavedWorkbooks();

    const tableRows = screen.getAllByTestId('table-body-rows');
    expect(tableRows.length).toEqual(2);
  });
});
