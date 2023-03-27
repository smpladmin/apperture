import { render, screen, act, fireEvent } from '@testing-library/react';
import { createMockRouter } from '@tests/util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import SavedSegments from './index';
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import { Provider } from '@lib/domain/provider';

jest.mock('@lib/services/segmentService');

describe('segments watchlist table', () => {
  let mockedGetSavedSegmentsForDatasourceId: jest.Mock;
  const savedSegments = [
    {
      _id: '63d0feda2f4dd4305186cdfa',
      createdAt: '2023-01-25T10:05:14.446000',
      updatedAt: '2023-01-25T10:05:14.446000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'City segment',
      description: '',
      groups: [
        {
          filters: [
            {
              operand: 'properties.$city',
              operator: 'is',
              values: ['Hyderabad', 'Delhi', 'Mumbai', 'Jaipur'],
              all: false,
              condition: 'where',
              datatype: 'String',
              type: 'where',
            },
            {
              operand: 'Mobile_Number_Added',
              operator: 'equals',
              values: ['1'],
              triggered: true,
              aggregation: 'total',
              date_filter: {
                days: 30,
              },
              date_filter_type: 'last',
              condition: 'who',
              type: 'who',
              datatype: 'Number',
            },
          ],
          condition: 'and',
        },
      ],
      columns: ['user_id', 'properties.$city'],
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
      _id: '63d0feda2f4dd4305186cdfa',
      createdAt: '2023-01-25T10:05:14.446000',
      updatedAt: '2023-01-25T10:05:14.446000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'City segment',
      description: '',
      groups: [
        {
          filters: [
            {
              operand: 'properties.$city',
              operator: 'is',
              values: ['Hyderabad', 'Delhi', 'Mumbai', 'Jaipur'],
              all: false,
              condition: 'where',
              datatype: 'String',
              type: 'where',
            },
          ],
          condition: 'and',
        },
      ],
      columns: ['user_id', 'properties.$city'],
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

  const renderSavedSegments = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: '/analytics/funnel/list',
            query: { dsId: '63d0a7bfc636cee15d81f579' },
          })}
        >
          <SavedSegments provider={Provider.MIXPANEL} />
        </RouterContext.Provider>
      );
    });
  };
  beforeEach(() => {
    mockedGetSavedSegmentsForDatasourceId = jest.mocked(
      getSavedSegmentsForDatasourceId
    );

    mockedGetSavedSegmentsForDatasourceId.mockReturnValue(savedSegments);
  });

  it('should render segment watchlist table', async () => {
    await renderSavedSegments();

    const tableRows = screen.getAllByTestId('table-body-rows');
    expect(tableRows.length).toEqual(2);
  });

  it('should be able to delete segment ', async () => {
    await renderSavedSegments();
    const moreIcon = screen.getAllByTestId('action-more-icon');
    fireEvent.click(moreIcon[0]);

    const deleteOption = screen.getAllByTestId('table-action-delete');
    fireEvent.click(deleteOption[0]);

    const confirmationModal = screen.getByTestId('confirmation-modal');
    expect(confirmationModal).toBeInTheDocument();

    const primaryActionButton = screen.getByTestId('primary-action');
    await act(async () => {
      fireEvent.click(primaryActionButton);
      mockedGetSavedSegmentsForDatasourceId.mockReturnValue([
        {
          _id: '63d0feda2f4dd4305186cdfa',
          createdAt: '2023-01-25T10:05:14.446000',
          updatedAt: '2023-01-25T10:05:14.446000',
          datasourceId: '63d0a7bfc636cee15d81f579',
          appId: '63ca46feee94e38b81cda37a',
          userId: '6374b74e9b36ecf7e0b4f9e4',
          name: 'City segment',
          description: '',
          groups: [
            {
              filters: [
                {
                  operand: 'properties.$city',
                  operator: 'is',
                  values: ['Hyderabad', 'Delhi', 'Mumbai', 'Jaipur'],
                  all: false,
                  condition: 'where',
                  datatype: 'String',
                  type: 'where',
                },
              ],
              condition: 'and',
            },
          ],
          columns: ['user_id', 'properties.$city'],
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
