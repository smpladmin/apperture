import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Sanity from './index';
import { createMockRouter } from 'tests/util';
import { getEvents } from '@lib/services/datasourceService';
import { SanityDataSource } from '@lib/domain/eventData';

jest.mock('@lib/services/datasourceService');

describe('Sanity Table', () => {
  let mockedGetEvents: jest.Mock;

  const renderSanityTable = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '64349843748' } })}
        >
          <Sanity />
        </RouterContext.Provider>
      );
    });
  };

  beforeEach(() => {
    mockedGetEvents = jest.mocked(getEvents);
    mockedGetEvents.mockReturnValue({
      count: 2,
      data: [
        { abc: '1', def: '2' },
        { abc: '3', def: '4' },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("'all' option should be pre-selected on page load", async () => {
    await renderSanityTable();
    const All = screen.getByTestId(SanityDataSource.ALL);
    expect(All.classList).toContain('active-All');
    const count = screen.getByTestId('sanity-table-count');
    expect(count.textContent).toEqual('2 Records');
  });

  it("tab changes on selecting 'Mixpanel' header", async () => {
    await renderSanityTable();
    const Mixpanel = screen.getByTestId(SanityDataSource.MIXPANEL);
    fireEvent.click(Mixpanel);
    await waitFor(() => {
      expect(mockedGetEvents).toBeCalledWith('64349843748', false, 'Mixpanel');
      expect(Mixpanel.classList).toContain('active-Mixpanel');
      const count = screen.getByTestId('sanity-table-count');
      expect(count.textContent).toEqual('2 Records');
    });
  });

  it('should render table with all columns and rows', async () => {
    await renderSanityTable();
    const BackendCRM = screen.getByTestId(SanityDataSource.BACKEND);
    fireEvent.click(BackendCRM);
    await waitFor(() => {
      const tableBodyRows = screen.getAllByTestId('sanity-table-body-rows');
      expect(tableBodyRows.length).toEqual(2);

      const firstRowTableCells = tableBodyRows[0].getElementsByTagName('td');
      expect(firstRowTableCells[0]).toHaveTextContent('1');
      expect(firstRowTableCells[1]).toHaveTextContent('2');

      const secondRowTableCells = tableBodyRows[1].getElementsByTagName('td');
      expect(secondRowTableCells[0]).toHaveTextContent('3');
      expect(secondRowTableCells[1]).toHaveTextContent('4');
    });
  });
});
