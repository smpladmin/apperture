import { render, screen, act, fireEvent } from '@testing-library/react';
import { createMockRouter } from '@tests/util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import SavedNotifications from './index';
import { getSavedNotificationsForDatasourceId } from '@lib/services/notificationService';

jest.mock('@lib/services/notificationService');

describe('notifications watchlist table', () => {
  let mockedGetSavedNotificationsForDatasourceId: jest.Mock;
  const savedNotifications = [
    {
      _id: '63dbc1e62effb8f88f60e240',
      createdAt: '2023-03-20T11:33:40.575863',
      updatedAt: '2023-03-06T11:27:35.200000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      appId: '63ca46feee94e38b81cda37a',
      name: 'Funnel',
      notificationType: ['update', 'alert'],
      metric: 'users',
      multiNode: false,
      appertureManaged: false,
      pctThresholdActive: false,
      pctThresholdValues: null,
      absoluteThresholdActive: true,
      absoluteThresholdValues: {
        min: 57.0,
        max: 89.0,
      },
      formula: 'a',
      variableMap: {
        a: ['Funnel'],
      },
      preferredHourGmt: 5,
      frequency: 'daily',
      preferredChannels: ['slack'],
      notificationActive: false,
      variant: 'funnel',
      reference: '63d36d10eb1e7db6cd4db69a',
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
      _id: '63dcb6674d45bd3f0a204c6b',
      createdAt: '2023-03-20T11:33:40.576442',
      updatedAt: '2023-03-06T11:28:25.949000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      appId: '63ca46feee94e38b81cda37a',
      name: 'Test Metric',
      notificationType: ['alert'],
      metric: 'hits',
      multiNode: false,
      appertureManaged: false,
      pctThresholdActive: true,
      pctThresholdValues: {
        min: -8.0,
        max: 8.0,
      },
      absoluteThresholdActive: false,
      absoluteThresholdValues: null,
      formula: 'a',
      variableMap: {
        a: ['Test Metric'],
      },
      preferredHourGmt: 5,
      frequency: 'daily',
      preferredChannels: ['slack'],
      notificationActive: true,
      variant: 'metric',
      reference: '63db9dad0a9b0c24aed61571',
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

  const renderSavedNotifications = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: '/analytics/funnel/list',
            query: { dsId: '63d0a7bfc636cee15d81f579' },
          })}
        >
          <SavedNotifications />
        </RouterContext.Provider>
      );
    });
  };
  beforeEach(() => {
    mockedGetSavedNotificationsForDatasourceId = jest.mocked(
      getSavedNotificationsForDatasourceId
    );

    mockedGetSavedNotificationsForDatasourceId.mockReturnValue(
      savedNotifications
    );
  });

  it('should render notifications watchlist table', async () => {
    await renderSavedNotifications();

    const tableRows = screen.getAllByTestId('table-body-rows');
    expect(tableRows.length).toEqual(2);
  });

  it('should be able to delete notification ', async () => {
    await renderSavedNotifications();
    const moreIcon = screen.getAllByTestId('action-more-icon');
    fireEvent.click(moreIcon[0]);

    const deleteOption = screen.getAllByTestId('table-action-delete');
    fireEvent.click(deleteOption[0]);

    const confirmationModal = screen.getByTestId('confirmation-modal');
    expect(confirmationModal).toBeInTheDocument();

    const primaryActionButton = screen.getByTestId('primary-action');
    await act(async () => {
      fireEvent.click(primaryActionButton);
      mockedGetSavedNotificationsForDatasourceId.mockReturnValue([
        {
          _id: '63dcb6674d45bd3f0a204c6b',
          createdAt: '2023-03-20T11:33:40.576442',
          updatedAt: '2023-03-06T11:28:25.949000',
          datasourceId: '63d0a7bfc636cee15d81f579',
          userId: '6374b74e9b36ecf7e0b4f9e4',
          appId: '63ca46feee94e38b81cda37a',
          name: 'Test Metric',
          notificationType: ['alert'],
          metric: 'hits',
          multiNode: false,
          appertureManaged: false,
          pctThresholdActive: true,
          pctThresholdValues: {
            min: -8.0,
            max: 8.0,
          },
          absoluteThresholdActive: false,
          absoluteThresholdValues: null,
          formula: 'a',
          variableMap: {
            a: ['Test Metric'],
          },
          preferredHourGmt: 5,
          frequency: 'daily',
          preferredChannels: ['slack'],
          notificationActive: true,
          variant: 'metric',
          reference: '63db9dad0a9b0c24aed61571',
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
