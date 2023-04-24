import { fireEvent, render, screen, act } from '@testing-library/react';
import React from 'react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Retention from './index';
import { createMockRouter } from 'tests/util';
import { capitalizeFirstLetter } from '@lib/utils/common';
import { MapContext } from '@lib/contexts/mapContext';
import { Node } from '@lib/domain/node';
import {
  getTransientRetentionData,
  getTransientTrendsData,
} from '@lib/services/retentionService';
import { hasValidEvents } from '../utils';

jest.mock('../utils');
jest.mock('@lib/utils/common');
jest.mock('@lib/services/retentionService');
jest.mock('@lib/services/datasourceService');

describe('create retention', () => {
  let mockedCapitalizeLetter: jest.Mock;
  let mockedHasValidEvents: jest.Mock;
  let mockGetTransientTrendsData: jest.Mock;
  let mockGetTransientRetentionData: jest.Mock;

  const addEvent = async (eventName: string) => {
    const selectElementByText = screen.getByText(eventName);

    await act(async () => {
      fireEvent.click(selectElementByText);
    });
  };

  const renderRetention = async (
    router = createMockRouter({
      pathname: '/analytics/retention/create',
      query: { dsId: '654212033222' },
    })
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <MapContext.Provider
            value={{
              state: {
                nodes: [
                  {
                    id: 'Video_Click',
                    name: 'Video_Click',
                    source: 'mixpanel',
                  },
                  {
                    id: 'Chapter_Click',
                    name: 'Video_Click',
                    source: 'mixpanel',
                  },
                  {
                    id: 'Topic_Click',
                    name: 'Video_Click',
                    source: 'mixpanel',
                  },
                ] as Node[],
                nodesData: [],
                activeNode: null,
                isNodeSearched: false,
              },
              dispatch: () => {},
            }}
          >
            <Retention />
          </MapContext.Provider>
        </RouterContext.Provider>
      );
    });
  };

  const retentionTrendsData = [
    {
      granularity: '2022-11-21T00:00:00',
      retainedUsers: 100,
      retentionRate: 66.17,
    },
    {
      granularity: '2022-11-22T00:00:00',
      retainedUsers: 67,
      retentionRate: 45.4,
    },

    {
      granularity: '2022-11-23T00:00:00',
      retainedUsers: 45,
      retentionRate: 33.9,
    },

    {
      granularity: '2022-11-24T00:00:00',
      retainedUsers: 22,
      retentionRate: 24.2,
    },
  ];

  const retentionData = {
    count: 4,
    data: [
      { name: 'day 0', value: '55.13' },
      { name: 'day 1', value: '31.25' },
      { name: 'day 2', value: '18.9' },
      { name: 'day 3', value: '10.6' },
    ],
  };

  beforeEach(() => {
    mockGetTransientTrendsData = jest.mocked(getTransientTrendsData);
    mockGetTransientRetentionData = jest.mocked(getTransientRetentionData);

    mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedHasValidEvents = jest.mocked(hasValidEvents);

    mockGetTransientTrendsData.mockReturnValue(retentionTrendsData);
    mockGetTransientRetentionData.mockReturnValue(retentionData);
    mockedHasValidEvents.mockReturnValue(true);
    mockedCapitalizeLetter.mockImplementation((val: string) => {
      const capitalizedFirstLetterMap: { [key: string]: string } = {
        days: 'Days',
        weeks: 'Weeks',
        months: 'Months',
        mixpanel: 'Mixpanel',
      };
      return capitalizedFirstLetterMap[val];
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => jest.clearAllMocks());

  describe('create retention', () => {
    it('selects an event for startEvent', async () => {
      await renderRetention();
      const eventSelection = screen.getAllByTestId('event-selection');
      fireEvent.click(eventSelection[0]);

      const options = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(options[0]);
      });
      const startEvent = screen.getAllByTestId('event-selection')[0];
      expect(startEvent.textContent).toEqual('Video_Click');
    });

    it('opens the granularity dropdown and selects days as granularity', async () => {
      await renderRetention();
      const granularityDropdown = screen.getByTestId('granularity-list');
      fireEvent.click(granularityDropdown);
      const granularityTypes = screen.getAllByTestId('granularity-type');
      expect(granularityTypes[0].textContent).toEqual('Days');
      fireEvent.click(granularityTypes[0]);
      expect(mockGetTransientRetentionData).toBeCalled();
      expect(mockGetTransientTrendsData).toBeCalled();
    });

    it('changes the date filter to 1M', async () => {
      await renderRetention();
      const oneMonthFilter = screen.getByTestId('month');
      await act(async () => {
        fireEvent.click(oneMonthFilter);
      });
      expect(mockGetTransientRetentionData).toBeCalled();
      expect(mockGetTransientTrendsData).toBeCalled();
    });

    it('changes the tab to Day 1 on clicking on Day 1', async () => {
      await renderRetention();
      expect(mockGetTransientRetentionData).toBeCalled();
      const intervalTabs = screen.getAllByTestId('interval-tab');
      await act(async () => {
        fireEvent.click(intervalTabs[1]);
      });
      expect(mockGetTransientTrendsData).toBeCalled();
    });
  });
});
