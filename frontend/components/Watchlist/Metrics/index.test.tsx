import { render, screen, act, fireEvent } from '@testing-library/react';
import { createMockRouter } from '@tests/util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import SavedMetric from './index';
import { Provider } from '@lib/domain/provider';
import { getSavedMetricsForDatasourceId } from '@lib/services/metricService';

jest.mock('@lib/services/metricService');

describe('metrics watchlist table', () => {
  let mockedGetSavedMetricForDatasourceId: jest.Mock;
  const savedMetric = [
    {
      _id: '63dcfe6a21a93919c672d5bb',
      createdAt: '2023-02-03T12:30:34.757000',
      updatedAt: '2023-03-02T17:53:54.380000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'Alert Metric -Updated',
      function: 'A*2',
      aggregates: [
        {
          variable: 'A',
          variant: 'event',
          aggregations: {
            functions: 'count',
            property: 'Video_Open',
          },
          reference_id: 'Video_Open',
          filters: [],
          conditions: [],
        },
      ],
      breakdown: [],
      dateFilter: null,
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
      _id: '63fdc7b2d87543593f8d0236',
      createdAt: '2023-02-28T09:21:53.858000',
      updatedAt: '2023-03-15T11:50:45.121000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'Metric - With Breakdown',
      function: 'A*12',
      aggregates: [
        {
          variable: 'A',
          variant: 'event',
          aggregations: {
            functions: 'count',
            property: 'Video_Open',
          },
          reference_id: 'Video_Open',
          filters: [],
          conditions: [],
        },
      ],
      breakdown: ['properties.$app_release'],
      dateFilter: {
        filter: {
          days: 90,
        },
        type: 'last',
      },
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

  const renderSavedMetrics = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: '/analytics/funnel/list',
            query: { dsId: '63d0a7bfc636cee15d81f579' },
          })}
        >
          <SavedMetric provider={Provider.MIXPANEL} />
        </RouterContext.Provider>
      );
    });
  };
  beforeEach(() => {
    mockedGetSavedMetricForDatasourceId = jest.mocked(
      getSavedMetricsForDatasourceId
    );

    mockedGetSavedMetricForDatasourceId.mockReturnValue(savedMetric);
  });

  it('should render metric watchlist table', async () => {
    await renderSavedMetrics();

    const tableRows = screen.getAllByTestId('table-body-rows');
    expect(tableRows.length).toEqual(2);
  });

  it('should be able to delete metric ', async () => {
    await renderSavedMetrics();
    const moreIcon = screen.getAllByTestId('action-more-icon');
    fireEvent.click(moreIcon[0]);

    const deleteOption = screen.getAllByTestId('table-action-delete');
    fireEvent.click(deleteOption[0]);

    const confirmationModal = screen.getByTestId('confirmation-modal');
    expect(confirmationModal).toBeInTheDocument();

    const primaryActionButton = screen.getByTestId('primary-action');
    await act(async () => {
      fireEvent.click(primaryActionButton);
      mockedGetSavedMetricForDatasourceId.mockReturnValue([
        {
          _id: '63fdc7b2d87543593f8d0236',
          createdAt: '2023-02-28T09:21:53.858000',
          updatedAt: '2023-03-15T11:50:45.121000',
          datasourceId: '63d0a7bfc636cee15d81f579',
          appId: '63ca46feee94e38b81cda37a',
          userId: '6374b74e9b36ecf7e0b4f9e4',
          name: 'Metric - With Breakdown',
          function: 'A*12',
          aggregates: [
            {
              variable: 'A',
              variant: 'event',
              aggregations: {
                functions: 'count',
                property: 'Video_Open',
              },
              reference_id: 'Video_Open',
              filters: [],
              conditions: [],
            },
          ],
          breakdown: ['properties.$app_release'],
          dateFilter: {
            filter: {
              days: 90,
            },
            type: 'last',
          },
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
