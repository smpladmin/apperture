import { render, screen, act } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import DataStreamView from './index';
import { createMockRouter } from 'tests/util';
import { getClickstreamData } from '@lib/services/clickStreamService';
import { formateventLabel } from './Components/EventLabel';
import { trimLabel } from '@lib/utils/common';

jest.mock('@lib/services/clickStreamService');

describe('Datastream Table', () => {
  let mockedGetClickstreamData: jest.Mock;

  const apiResponse = {
    count: 2,
    data: [
      {
        event: '$pageview',
        timestamp: '2023-02-09T04:50:47',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/app/create',
        source: 'web',
      },
      {
        event: '$pageview',
        timestamp: '2023-02-07T08:45:13',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc',
        source: 'web',
      },
    ],
  };

  const renderDatastreamTable = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { dsId: '63d8ef5a7b02dbd1dcf20dc3' },
          })}
        >
          <DataStreamView />
        </RouterContext.Provider>
      );
    });
  };

  beforeEach(() => {
    mockedGetClickstreamData = jest.mocked(getClickstreamData);
    mockedGetClickstreamData.mockReturnValue({
      count: 2,
      data: [
        {
          event: '$pageview',
          timestamp: '2023-02-09T04:50:47',
          uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
          url: 'http://localhost:3000/analytics/app/create',
          source: 'web',
        },
        {
          event: '$pageview',
          timestamp: '2023-02-07T08:45:13',
          uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
          url: 'http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc',
          source: 'web',
        },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the table with the given values', async () => {
    await renderDatastreamTable();
    const urls = screen.getAllByTestId('url-cell');
    const uids = screen.getAllByTestId('uid-cell');
    const sources = screen.getAllByTestId('source-cell');
    const events = screen.getAllByTestId('event-cell');

    expect(events[0].textContent).toEqual(
      formateventLabel(apiResponse.data[0].event)[1]
    );
    expect(uids[0].textContent).toEqual(trimLabel(apiResponse.data[0].uid));
    expect(urls[0].textContent).toEqual(apiResponse.data[0].url);
    expect(sources[0].textContent).toEqual(
      trimLabel(apiResponse.data[0].source)
    );
  });
});
