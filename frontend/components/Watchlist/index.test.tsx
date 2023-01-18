import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import Watchlist from './index';
import { getSavedFunnelsForUser } from '@lib/services/funnelService';
import { getSavedNotificationsForUser } from '@lib/services/notificationService';
import { AppertureContext } from '@lib/contexts/appertureContext';

jest.mock('@lib/services/funnelService');
jest.mock('@lib/services/notificationService');

describe.skip('Watchlist', () => {
  let mockedSavedFunnels: jest.Mock;
  let mockedSavedNotifications: jest.Mock;

  beforeEach(() => {
    mockedSavedFunnels = jest.mocked(getSavedFunnelsForUser);
    mockedSavedNotifications = jest.mocked(getSavedNotificationsForUser);
    mockedSavedFunnels.mockReturnValue([
      {
        type: 'funnels',
        details: {
          _id: '64232838273844',
          userId: '289223232121',
          appId: '68438434434',
          name: 'Test Funnel ',
          datasourceId: '654212033222',
          steps: [
            { event: 'Video_Click', filters: [] },
            { event: 'Chapter_Click', filters: [] },
          ],
        },
      },
      {
        type: 'funnels',
        details: {
          _id: '64232838273854',
          userId: '289223232121',
          appId: '68438434434',
          name: 'Otp Funnel ',
          datasourceId: '654212033222',
          steps: [
            { event: 'Otp_Sent', filters: [] },
            { event: 'Otp_Entered', filters: [] },
          ],
        },
      },
    ]);
    mockedSavedNotifications.mockReturnValue([
      {
        type: 'notifications',
        details: {
          _id: '64232838273867',
          userId: '389223232121',
          appId: '6982633223312',
          name: '/add_to_cart',
          datasourceId: '654212033222',
        },
      },
    ]);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('render watchlist page', () => {
    it('should render three watchlist options, i.e. All , Notifications, funnel ', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ pathname: '/analytics/saved' })}
          >
            <Watchlist />
          </RouterContext.Provider>
        );
      });
      const watchListItemOptions = screen.getAllByTestId('watchlistitem');
      const table = screen.getByTestId('watchlist-table');
      await waitFor(() => {
        expect(table).toBeInTheDocument();
      });

      expect(watchListItemOptions.length).toEqual(3);
      expect(watchListItemOptions[0]).toHaveTextContent('All');
      expect(watchListItemOptions[1]).toHaveTextContent('Notifications');
      expect(watchListItemOptions[2]).toHaveTextContent('Funnels');
    });
  });

  describe('switching watchlist options', () => {
    it('should render only notifications when Notifications option is selected', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ pathname: '/analytics/saved' })}
          >
            <Watchlist />
          </RouterContext.Provider>
        );
      });
      const notificationOption = screen.getByLabelText('Notifications');

      fireEvent.click(notificationOption);
      await waitFor(() => {
        const tableBodyRows = screen.getAllByTestId('table-body-rows');
        const tableCells = tableBodyRows[0].getElementsByTagName('td');

        // there is 1 mocked saved notification
        expect(tableBodyRows.length).toEqual(1);
        expect(tableCells[0]).toHaveTextContent('Notification');
        expect(tableCells[1]).toHaveTextContent('/add_to_cart');
      });
    });

    it('should render only funnels when Funnels option is selected', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ pathname: '/analytics/saved' })}
          >
            <Watchlist />
          </RouterContext.Provider>
        );
      });
      const funnelOption = screen.getByLabelText('Funnels');
      fireEvent.click(funnelOption);
      await waitFor(() => {
        const tableBodyRows = screen.getAllByTestId('table-body-rows');
        // there are 2 mocked saved funnels
        expect(tableBodyRows.length).toEqual(2);

        const firstRowTableCells = tableBodyRows[0].getElementsByTagName('td');
        expect(firstRowTableCells[0]).toHaveTextContent('Funnel');
        expect(firstRowTableCells[1]).toHaveTextContent(
          'Test Funnel Video_Click -> Chapter_Click'
        );

        const secondRowTableCells = tableBodyRows[1].getElementsByTagName('td');
        expect(secondRowTableCells[0]).toHaveTextContent('Funnel');
        expect(secondRowTableCells[1]).toHaveTextContent(
          'Otp Funnel Otp_Sent -> Otp_Entered'
        );
      });
    });

    it(`should render all notifications and funnels initally when 'All' is selected by default or 'ALL' option is selected`, async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ pathname: '/analytics/saved' })}
          >
            <Watchlist />
          </RouterContext.Provider>
        );
      });

      const allOption = screen.getByLabelText('All');
      fireEvent.click(allOption);

      await waitFor(() => {
        const tableBodyRows = screen.getAllByTestId('table-body-rows');
        // total 3 mocked saved items
        expect(tableBodyRows.length).toEqual(3);
      });
    });
  });

  describe('watchlist table', () => {
    it(`should render 5 table headers for desktop which are 'Type', 'Name', 'Users', '% Change', '' `, async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ pathname: '/analytics/saved' })}
          >
            <Watchlist />
          </RouterContext.Provider>
        );
      });
      const tableHeaderText = ['Type', 'Name', 'Users', '% Change', ''];
      const tableHeaders = screen.getAllByTestId('watchlist-table-headers');
      expect(tableHeaders.length).toEqual(5);
      for (const header in tableHeaders) {
        expect(tableHeaders[header]).toHaveTextContent(tableHeaderText[header]);
      }
    });

    it(`should render only 2 table headers for mobile which are 'Name' and 'Users' `, async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ pathname: '/analytics/saved' })}
          >
            <AppertureContext.Provider value={{ device: { isMobile: true } }}>
              <Watchlist />
            </AppertureContext.Provider>
          </RouterContext.Provider>
        );
      });
      const mobileTableHeaderText = ['Name', 'Users'];
      const tableHeaders = screen.getAllByTestId('watchlist-table-headers');
      expect(tableHeaders.length).toEqual(2);
      for (const header in tableHeaders) {
        expect(tableHeaders[header]).toHaveTextContent(
          mobileTableHeaderText[header]
        );
      }
    });

    it('redirects user to funnel page when clicked on row which has type funnel', async () => {
      const router = createMockRouter({
        pathname: '/analytics/saved',
      });
      await act(async () => {
        render(
          <RouterContext.Provider value={router}>
            <Watchlist />
          </RouterContext.Provider>
        );
      });

      const funnelRow = screen.getByText('Otp Funnel');
      fireEvent.click(funnelRow);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/analytics/funnel/view/[funnelId]',
        query: { funnelId: '64232838273854' },
      });
    });
  });
});
