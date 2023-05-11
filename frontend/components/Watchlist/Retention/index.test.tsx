import { render, screen, act, fireEvent } from '@testing-library/react';
import { createMockRouter } from '@tests/util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import SavedRetentions from './index';
import { Provider } from '@lib/domain/provider';
import { Granularity } from '@lib/domain/retention';
import { getSavedRetentionsForDatasourceId } from '@lib/services/retentionService';

jest.mock('@lib/services/retentionService');

describe('retentions watchlist table', () => {
  let mockedGetSavedRetentionsForDatasourceId: jest.Mock;
  const savedRetentions = [
    {
      _id: '640a1cf60e1977dd50d2719d',
      createdAt: '2023-03-09T17:52:54.385000',
      updatedAt: '2023-03-16T06:33:22.530000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'Video Retention',
      startEvent: {
        event: 'Video_Open',
        filters: [],
      },
      goalEvent: {
        event: 'Video_Seen',
        filters: [],
      },
      dateFilter: {
        filter: {
          days: 90,
        },
        type: 'last',
      },
      granularity: Granularity.DAYS,
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
      name: ' Retention without filter',
      startEvent: {
        event: 'Video_Open',
        filters: [],
      },
      goalEvent: {
        event: 'Video_Seen',
        filters: [],
      },
      dateFilter: {
        filter: {
          days: 90,
        },
        type: 'last',
      },
      granularity: Granularity.DAYS,
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

  const renderSavedRetentions = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: '/analytics/retention/list',
            query: { dsId: '63d0a7bfc636cee15d81f579' },
          })}
        >
          <SavedRetentions provider={Provider.MIXPANEL} />
        </RouterContext.Provider>
      );
    });
  };
  beforeEach(() => {
    mockedGetSavedRetentionsForDatasourceId = jest.mocked(
      getSavedRetentionsForDatasourceId
    );

    mockedGetSavedRetentionsForDatasourceId.mockReturnValue(savedRetentions);
  });

  it('should render retention watchlist table', async () => {
    await renderSavedRetentions();

    const tableRows = screen.getAllByTestId('table-body-rows');
    expect(tableRows.length).toEqual(2);
  });

  it('should be able to delete retention ', async () => {
    await renderSavedRetentions();
    const moreIcon = screen.getAllByTestId('action-more-icon');
    fireEvent.click(moreIcon[0]);

    const deleteOption = screen.getAllByTestId('table-action-delete');
    fireEvent.click(deleteOption[0]);

    const confirmationModal = screen.getByTestId('confirmation-modal');
    expect(confirmationModal).toBeInTheDocument();

    const primaryActionButton = screen.getByTestId('primary-action');
    await act(async () => {
      fireEvent.click(primaryActionButton);
      mockedGetSavedRetentionsForDatasourceId.mockReturnValue([
        {
          _id: '640ae6d84841d765c5fea9f3',
          createdAt: '2023-03-10T08:14:16.969000',
          updatedAt: '2023-03-10T08:16:20.697000',
          datasourceId: '63d0a7bfc636cee15d81f579',
          appId: '63ca46feee94e38b81cda37a',
          userId: '6374b74e9b36ecf7e0b4f9e4',
          name: 'Retention without filter',
          startEvent: {
            event: 'Video_Open',
            filters: [],
          },
          goalEvent: {
            event: 'Video_Seen',
            filters: [],
          },
          dateFilter: {
            filter: {
              days: 90,
            },
            type: 'last',
          },
          granularity: Granularity.DAYS,
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
