import { render, screen, act, fireEvent } from '@testing-library/react';
import { createMockRouter } from '@tests/util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import SavedFunnel from './index';
import { Provider } from '@lib/domain/provider';
import { getSavedFunnelsForDatasourceId } from '@lib/services/funnelService';

jest.mock('@lib/services/funnelService');

describe('funnels watchlist table', () => {
  let mockedGetSavedFunnelsForDatasourceId: jest.Mock;
  const savedFunnels = [
    {
      _id: '640a1cf60e1977dd50d2719d',
      createdAt: '2023-03-09T17:52:54.385000',
      updatedAt: '2023-03-16T06:33:22.530000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'Date Filter Funnel',
      steps: [
        {
          event: 'Video_Open',
          filters: [],
        },
        {
          event: 'Video_Seen',
          filters: [],
        },
      ],
      randomSequence: false,
      dateFilter: {
        filter: {
          days: 90,
        },
        type: 'last',
      },
      conversionWindow: null,
      enabled: true,
      user: {
        firstName: 'Anish',
        lastName: 'Kaushal',
        email: 'anish@parallelhq.com',
        picture:
          'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
        slackChannel: null,
      },
    },
    {
      _id: '640ae6d84841d765c5fea9f3',
      createdAt: '2023-03-10T08:14:16.969000',
      updatedAt: '2023-03-10T08:16:20.697000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: ' Funnel without filter',
      steps: [
        {
          event: 'Video_Open',
          filters: [],
        },
        {
          event: 'Video_Seen',
          filters: [],
        },
      ],
      randomSequence: false,
      dateFilter: {
        filter: null,
        type: null,
      },
      conversionWindow: null,
      enabled: true,
      user: {
        firstName: 'Anish',
        lastName: 'Kaushal',
        email: 'anish@parallelhq.com',
        picture:
          'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
        slackChannel: null,
      },
    },
  ];

  const renderSavedFunnels = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: '/analytics/funnel/list',
            query: { dsId: '63d0a7bfc636cee15d81f579' },
          })}
        >
          <SavedFunnel provider={Provider.MIXPANEL} />
        </RouterContext.Provider>
      );
    });
  };
  beforeEach(() => {
    mockedGetSavedFunnelsForDatasourceId = jest.mocked(
      getSavedFunnelsForDatasourceId
    );

    mockedGetSavedFunnelsForDatasourceId.mockReturnValue(savedFunnels);
  });

  it('should render funnel watchlist table', async () => {
    await renderSavedFunnels();

    const tableRows = screen.getAllByTestId('table-body-rows');
    expect(tableRows.length).toEqual(2);
  });

  it('should be able to delete funnel ', async () => {
    await renderSavedFunnels();
    const moreIcon = screen.getAllByTestId('action-more-icon');
    fireEvent.click(moreIcon[0]);

    const deleteOption = screen.getAllByTestId('table-action-delete');
    fireEvent.click(deleteOption[0]);

    const confirmationModal = screen.getByTestId('confirmation-modal');
    expect(confirmationModal).toBeInTheDocument();

    const primaryActionButton = screen.getByTestId('primary-action');
    await act(async () => {
      fireEvent.click(primaryActionButton);
      mockedGetSavedFunnelsForDatasourceId.mockReturnValue([
        {
          _id: '640ae6d84841d765c5fea9f3',
          createdAt: '2023-03-10T08:14:16.969000',
          updatedAt: '2023-03-10T08:16:20.697000',
          datasourceId: '63d0a7bfc636cee15d81f579',
          appId: '63ca46feee94e38b81cda37a',
          userId: '6374b74e9b36ecf7e0b4f9e4',
          name: ' Funnel without filter',
          steps: [
            {
              event: 'Video_Open',
              filters: [],
            },
            {
              event: 'Video_Seen',
              filters: [],
            },
          ],
          randomSequence: false,
          dateFilter: {
            filter: null,
            type: null,
          },
          conversionWindow: null,
          enabled: true,
          user: {
            firstName: 'Anish',
            lastName: 'Kaushal',
            email: 'anish@parallelhq.com',
            picture:
              'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
            slackChannel: null,
          },
        },
      ]);
    });
    const tableRows = screen.getAllByTestId('table-body-rows');
    expect(tableRows.length).toEqual(1);
  });
});
