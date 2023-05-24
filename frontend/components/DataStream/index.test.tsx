import { render, screen, act } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import DataStreamView from './index';
import { createMockRouter } from 'tests/util';
import { getClickstreamData } from '@lib/services/clickStreamService';
import { trimLabel } from '@lib/utils/common';

jest.mock('@lib/services/clickStreamService');

describe('Datastream Table', () => {
  let mockedGetClickstreamData: jest.Mock;

  const apiResponse = {
    count: 4,
    data: [
      {
        event: {
          name: '$autocapture',
          type: 'change',
          elements: {
            text: '',
            href: '',
            tag_name: 'input',
          },
        },
        timestamp: '2023-02-09T04:50:47',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/app/create',
        source: 'web',
      },
      {
        event: {
          name: 'precise event',
          type: '',
          elements: {
            text: '',
            href: '',
            tag_name: '',
          },
        },
        timestamp: '2023-02-07T08:45:13',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc',
        source: 'web',
      },
      {
        event: {
          name: '$autocapture',
          type: 'click',
          elements: {
            text: 'Add to cart',
            href: '',
            tag_name: 'button',
          },
        },
        timestamp: '2023-02-09T04:50:47',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/app/create',
        source: 'web',
      },
      {
        event: {
          name: '$autocapture',
          type: 'click',
          elements: {
            text: 'Contact',
            href: '#contact',
            tag_name: 'a',
          },
        },
        timestamp: '2023-02-09T04:50:47',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/app/create',
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
    mockedGetClickstreamData.mockReturnValue(apiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the table with the given values for input change', async () => {
    await renderDatastreamTable();
    const urls = screen.getAllByTestId('url-cell');
    const uids = screen.getAllByTestId('uid-cell');
    const sources = screen.getAllByTestId('source-cell');
    const events = screen.getAllByTestId('event-cell');

    expect(events[0].textContent).toEqual('Typed something into input ');
    expect(uids[0].textContent).toEqual(trimLabel(apiResponse.data[0].uid));
    expect(urls[0].textContent).toEqual(apiResponse.data[0].url);
    expect(sources[0].textContent).toEqual(
      trimLabel(apiResponse.data[0].source)
    );
  });

  it('should render the table with the given values for precise event', async () => {
    await renderDatastreamTable();
    const urls = screen.getAllByTestId('url-cell');
    const uids = screen.getAllByTestId('uid-cell');
    const sources = screen.getAllByTestId('source-cell');
    const events = screen.getAllByTestId('event-cell');

    expect(events[1].textContent).toEqual('precise event');
    expect(uids[1].textContent).toEqual(trimLabel(apiResponse.data[1].uid));
    expect(urls[1].textContent).toEqual(apiResponse.data[1].url);
    expect(sources[1].textContent).toEqual(
      trimLabel(apiResponse.data[1].source)
    );
  });
  it('should render the table with the given values for button click', async () => {
    await renderDatastreamTable();
    const urls = screen.getAllByTestId('url-cell');
    const uids = screen.getAllByTestId('uid-cell');
    const sources = screen.getAllByTestId('source-cell');
    const events = screen.getAllByTestId('event-cell');

    expect(events[3].textContent).toEqual('Clicked link with text "Contact"');
    expect(uids[3].textContent).toEqual(trimLabel(apiResponse.data[3].uid));
    expect(urls[3].textContent).toEqual(apiResponse.data[3].url);
    expect(sources[3].textContent).toEqual(
      trimLabel(apiResponse.data[3].source)
    );
  });
});
