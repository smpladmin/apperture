import {
  fireEvent,
  render,
  screen,
  act,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import RetentionComponent from './index';
import { createMockRouter } from 'tests/util';
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import { MapContext } from '@lib/contexts/mapContext';
import { Node } from '@lib/domain/node';
import {
  getTransientRetentionData,
  getTransientTrendsData,
  saveRetention,
  updateRetention,
} from '@lib/services/retentionService';
import {
  hasValidEvents,
  hasValidRetentionEventAndFilters,
  replaceEmptyStringWithPlaceholder,
} from '../utils';
import { Granularity, Retention } from '@lib/domain/retention';
import {
  DateFilterType,
  FilterConditions,
  FilterDataType,
  FilterOperatorsString,
  FilterType,
} from '@lib/domain/common';
import {
  getEventProperties,
  getEventPropertiesValue,
} from '@lib/services/datasourceService';

jest.mock('../utils');
jest.mock('@lib/services/segmentService');
jest.mock('@lib/services/retentionService');
jest.mock('@lib/services/datasourceService');

describe('create retention', () => {
  // let mockedCapitalizeLetter: jest.Mock;
  let mockedHasValidEvents: jest.Mock;
  let mockGetTransientTrendsData: jest.Mock;
  let mockSaveRetention: jest.Mock;
  let mockUpdateRetention: jest.Mock;
  let mockGetEventProperties: jest.Mock;
  let mockGetEventPropertiesValue: jest.Mock;
  let mockGetTransientRetentionData: jest.Mock;
  let mockHasValidRetentionEventAndFilters: jest.Mock;
  let mockReplaceEmptyStringWithPlaceholder: jest.Mock;
  let mockGetSavedSegmentsForDatasourceId: jest.Mock;

  const addEvent = async (eventName: string) => {
    const selectElementByText = screen.getByText(eventName);

    await act(async () => {
      fireEvent.click(selectElementByText);
    });
  };

  const addEventFilter = async (property: string, stepIndex = 0) => {
    const addFilterButton = screen.getAllByTestId('add-filter-button');
    fireEvent.click(addFilterButton[stepIndex]);

    const selectCityProperty = screen.getByText(property);
    await act(async () => {
      fireEvent.click(selectCityProperty);
    });

    const addFilterValueButton = screen.getByTestId(
      'add-event-property-values'
    );
    const selectAllValue = screen.getByText('Select all');
    fireEvent.click(selectAllValue);
    await act(async () => {
      fireEvent.click(addFilterValueButton);
    });
  };

  const getEventFilterText = (eventFilters: HTMLElement[], index: number) => {
    return Array.from(eventFilters[index].getElementsByTagName('p')).map(
      (el) => el.textContent
    );
  };

  const props: Retention = {
    _id: '64834034092324',
    appId: '645439584475',
    datasourceId: '654212033222',
    name: 'Test Retention',
    startEvent: {
      event: 'Video_Click',
      filters: [
        {
          condition: FilterConditions.WHERE,
          operand: 'city',
          operator: FilterOperatorsString.IS,
          values: ['Mumbai', 'Bengaluru'],
          type: FilterType.WHERE,
          datatype: FilterDataType.STRING,
          all: false,
        },
      ],
    },
    goalEvent: { event: 'Chapter_Click', filters: [] },
    granularity: Granularity.DAYS,
    dateFilter: {
      filter: {
        days: 90,
      },
      type: DateFilterType.LAST,
    },
    updatedAt: new Date(),
  };

  const renderRetention = async (
    router = createMockRouter({
      pathname: '/analytics/retention/create',
      query: { dsId: '654212033222' },
    }),
    renderWithProps = false,
    savedRetention = props
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
            {renderWithProps ? (
              <RetentionComponent savedRetention={savedRetention} />
            ) : (
              <RetentionComponent />
            )}
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

  const eventPropertiesValues = [
    ['Mumbai'],
    ['Delhi'],
    ['Kolkata'],
    ['Bengaluru'],
  ];

  const eventProperties = [
    'city',
    'device',
    'country',
    'app_version',
    'session_length',
  ];

  beforeEach(() => {
    mockGetTransientTrendsData = jest.mocked(getTransientTrendsData);
    mockGetTransientRetentionData = jest.mocked(getTransientRetentionData);

    // mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedHasValidEvents = jest.mocked(hasValidEvents);
    mockSaveRetention = jest.mocked(saveRetention);
    mockUpdateRetention = jest.mocked(updateRetention);
    mockGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockGetEventProperties = jest.mocked(getEventProperties);
    mockGetSavedSegmentsForDatasourceId = jest.mocked(
      getSavedSegmentsForDatasourceId
    );
    mockHasValidRetentionEventAndFilters = jest.mocked(
      hasValidRetentionEventAndFilters
    );
    mockReplaceEmptyStringWithPlaceholder = jest.mocked(
      replaceEmptyStringWithPlaceholder
    );

    mockGetTransientTrendsData.mockReturnValue(retentionTrendsData);
    mockGetTransientRetentionData.mockReturnValue(retentionData);
    mockedHasValidEvents.mockReturnValue(true);
    mockHasValidRetentionEventAndFilters.mockReturnValue(true);
    mockGetEventProperties.mockReturnValue(eventProperties);
    mockGetEventPropertiesValue.mockReturnValue(eventPropertiesValues);
    mockReplaceEmptyStringWithPlaceholder.mockImplementation((val: any) => {
      return val;
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => jest.clearAllMocks());

  describe('create retention action', () => {
    it('should select an event for startEvent', async () => {
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

    it('should render disabled save button when retentionEvents are not valid', async () => {
      mockHasValidRetentionEventAndFilters.mockReturnValue(false);
      await renderRetention();
      const saveButton = screen.getByTestId('save');

      expect(saveButton).toBeDisabled();
      expect(saveButton).toBeInTheDocument();
    });

    it('should enable save button when valid start and goal events are added', async () => {
      mockHasValidRetentionEventAndFilters.mockReturnValue(true);
      await renderRetention();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeEnabled();
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('save/update retention', () => {
    const router = createMockRouter({
      query: { dsId: '654212033222' },
      pathname: '/analytics/retention/create',
    });

    it('should be able to save retention when valid events are added', async () => {
      mockSaveRetention.mockReturnValue({
        status: 200,
        data: {
          _id: '64349843748',
          datasourceId: '654212033222',
          startEvent: { event: 'Video_Click', filters: [] },
          goalEvent: { event: 'Chapter_Click', filters: [] },
        },
      });

      await renderRetention(router);
      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/retention/view/[retentionId]',
          query: { retentionId: '64349843748', dsId: '654212033222' },
        });
      });
    });

    it('should not be redirected to retention page if save retention case fails', async () => {
      mockSaveRetention.mockReturnValue({
        status: 500,
        data: {},
      });
      mockHasValidRetentionEventAndFilters.mockReturnValue(true);
      await renderRetention();

      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledTimes(0);
      });
    });

    it('should update the retention when click on save button on edit page', async () => {
      mockUpdateRetention.mockReturnValue({
        status: 200,
        data: {
          _id: '64349843748',
          datasourceId: '654212033222',
          startEvent: { event: 'Video_Click', filters: [] },
          goalEvent: { event: 'Chapter_Click', filters: [] },
        },
      });

      const router = createMockRouter({
        query: { dsId: '654212033222', retentionId: '64349843748' },
        pathname: '/analytics/retention/edit',
      });

      await renderRetention(router);

      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateRetention).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/retention/view/[retentionId]',
          query: { retentionId: '64349843748', dsId: '654212033222' },
        });
      });
    });
  });

  describe('view retention empty state /retention chart', () => {
    it('should render empty state initially when there are no valid events for creating retention', async () => {
      mockedHasValidEvents.mockReturnValue(false);
      await renderRetention();
      const emptyRetentionState = screen.getByTestId('retention-empty-state');
      expect(emptyRetentionState).toBeInTheDocument();
    });

    it('should render retention chart', async () => {
      await renderRetention();
      const trendsChart = screen.getByTestId('retention-trend');
      expect(trendsChart).toBeInTheDocument();
      const emptyRetentionState = screen.queryByTestId('retention-empty-state');
      expect(emptyRetentionState).not.toBeInTheDocument();
    });
  });

  describe('edit retention flow - when props are passed to component', () => {
    it('should render prefilled retention name with passed prop name and have input fields equal to events passed in props', async () => {
      const router = createMockRouter({
        query: { retentionid: '64349843748', dsId: '654212033222' },
        pathname: '/analytics/retention/edit',
      });
      await renderRetention(router, true);
      const retentionName = screen.getByTestId('entity-name');
      const startEvent = screen.getAllByTestId('event-selection')[0];
      const goalEvent = screen.getAllByTestId('event-selection')[1];

      expect(startEvent.textContent).toEqual('Video_Click');
      expect(goalEvent.textContent).toEqual('Chapter_Click');

      expect(retentionName).toHaveDisplayValue('Test Retention');
    });
  });

  describe('add filters to retention event', () => {
    it('should add filter to retention event', async () => {
      await renderRetention();

      const startEvent = screen.getAllByTestId('event-selection')[0];
      fireEvent.click(startEvent);

      await addEvent('Video_Click');

      await addEventFilter('city');
      const eventFilters = screen.getAllByTestId('event-filter');
      const eventFilterText = getEventFilterText(eventFilters, 0);
      expect(eventFilterText).toEqual([
        'where',
        'city',
        'is',
        'Mumbai, Delhi, +2 more',
      ]);

      // add another filter
      mockGetEventPropertiesValue.mockReturnValue([
        ['android'],
        ['ios'],
        ['mac'],
        ['windows'],
      ]);
      await addEventFilter('device');
      const newAddedEventFilters = screen.getAllByTestId('event-filter');

      const secondEventFilterText = getEventFilterText(newAddedEventFilters, 1);
      expect(secondEventFilterText).toEqual([
        'and',
        'device',
        'is',
        'android, ios, +2 more',
      ]);
    });

    it('should be able to remove filter', async () => {
      await renderRetention();

      const startEvent = screen.getAllByTestId('event-selection')[0];
      fireEvent.click(startEvent);

      await addEvent('Video_Click');

      await addEventFilter('city');

      // add another device filter
      mockGetEventPropertiesValue.mockReturnValue([
        ['android'],
        ['ios'],
        ['mac'],
        ['windows'],
      ]);
      await addEventFilter('device');

      const eventFilters = screen.getAllByTestId('event-filter');
      fireEvent.mouseEnter(startEvent);

      // remove first city filter
      const removeFilterIcon = screen.getAllByTestId('remove-filter');
      await act(async () => {
        fireEvent.click(removeFilterIcon[0]);
      });

      const afterRemovingEventFilters = screen.getAllByTestId('event-filter');
      const afterRemovingEventFiltersText = getEventFilterText(
        afterRemovingEventFilters,
        0
      );

      // after removing filter, next filter should become 'where' from 'and'
      expect(afterRemovingEventFiltersText).toEqual([
        'where',
        'device',
        'is',
        'android, ios, +2 more',
      ]);
    });
  });

  describe('interval tabs', () => {
    it('should change the tab to Day 1 on clicking on Day 1', async () => {
      await renderRetention();
      expect(mockGetTransientRetentionData).toBeCalled();
      const intervalTabs = screen.getAllByTestId('interval-tab');
      await act(async () => {
        fireEvent.click(intervalTabs[1]);
      });
      expect(mockGetTransientTrendsData).toBeCalled();
    });
  });

  describe('date filters on retention', () => {
    it('should change the date filter to 1M', async () => {
      await renderRetention();
      const oneMonthFilter = screen.getByTestId('month');
      await act(async () => {
        fireEvent.click(oneMonthFilter);
      });
      expect(mockGetTransientRetentionData).toBeCalled();
      expect(mockGetTransientTrendsData).toBeCalled();
    });
  });

  describe('granularity dropdown', () => {
    it('should open the granularity dropdown and select days as granularity', async () => {
      await renderRetention();
      const granularityDropdown = screen.getByTestId('granularity-list');
      fireEvent.click(granularityDropdown);
      const granularityTypes = screen.getAllByTestId('granularity-type');
      expect(granularityTypes[0].textContent).toEqual('Days');
      fireEvent.click(granularityTypes[0]);
      expect(mockGetTransientRetentionData).toBeCalled();
      expect(mockGetTransientTrendsData).toBeCalled();
    });
  });
});
