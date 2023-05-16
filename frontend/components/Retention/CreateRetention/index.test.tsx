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
  saveRetention,
  updateRetention,
} from '@lib/services/retentionService';
import {
  convertToCohortData,
  convertToIntervalData,
  convertToTrendsData,
  hasValidEvents,
  hasValidRetentionEventAndFilters,
  substituteEmptyStringWithPlaceholder,
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
  let mockedHasValidEvents: jest.Mock;
  let mockSaveRetention: jest.Mock;
  let mockUpdateRetention: jest.Mock;
  let mockGetEventProperties: jest.Mock;
  let mockGetEventPropertiesValue: jest.Mock;
  let mockGetTransientRetentionData: jest.Mock;
  let mockHasValidRetentionEventAndFilters: jest.Mock;
  let mockSubstituteEmptyStringWithPlaceholder: jest.Mock;
  let mockGetSavedSegmentsForDatasourceId: jest.Mock;
  let mockConvertToIntervalData: jest.Mock;
  let mockConvertToTrendsData: jest.Mock;
  let mockConvertToCohortData: jest.Mock;

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

  const retentionData = [
    {
      granularity: '2022-11-24T00:00:00',
      interval: 0,
      intervalName: 'day 0',
      initialUsers: 202,
      retainedUsers: 113,
      retentionRate: 55.94,
    },
    {
      granularity: '2022-11-25T00:00:00',
      interval: 0,
      intervalName: 'day 0',
      initialUsers: 230,
      retainedUsers: 112,
      retentionRate: 48.7,
    },
    {
      granularity: '2022-11-26T00:00:00',
      interval: 1,
      intervalName: 'day 1',
      initialUsers: 206,
      retainedUsers: 108,
      retentionRate: 52.43,
    },
    {
      granularity: '2022-11-27T00:00:00',
      interval: 1,
      intervalName: 'day 1',
      initialUsers: 202,
      retainedUsers: 105,
      retentionRate: 51.98,
    },
    {
      granularity: '2022-11-26T00:00:00',
      interval: 2,
      intervalName: 'day 2',
      initialUsers: 206,
      retainedUsers: 108,
      retentionRate: 52.43,
    },
    {
      granularity: '2022-11-27T00:00:00',
      interval: 2,
      intervalName: 'day 2',
      initialUsers: 202,
      retainedUsers: 105,
      retentionRate: 51.98,
    },
  ];

  const retentionTrendsData = [
    {
      granularity: '2022-11-24T00:00:00',
      retainedUsers: 113,
      retentionRate: 55.94,
    },
    {
      granularity: '2022-11-25T00:00:00',
      retainedUsers: 112,
      retentionRate: 48.7,
    },
  ];

  const retentionIntervalData = {
    count: 3,
    data: [
      { name: 'day 0', value: '55.13' },
      { name: 'day 1', value: '31.25' },
      { name: 'day 2', value: '18.9' },
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

  const retetentionCohortData = [
    {
      cohort: '2022-11-24T00:00:00',
      size: 105,
      intervals: { 'day 0': 51.11, 'day 1': 43.46, 'day 2': 28.7 },
    },
    {
      cohort: '2022-11-25T00:00:00',
      size: 109,
      intervals: { 'day 0': 57.42, 'day 1': 49.55 },
    },
    {
      cohort: '2022-11-26T00:00:00',
      size: 103,
      intervals: { 'day 0': 53.91 },
    },
  ];

  beforeEach(() => {
    mockGetTransientRetentionData = jest.mocked(getTransientRetentionData);

    // mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedHasValidEvents = jest.mocked(hasValidEvents);
    mockSaveRetention = jest.mocked(saveRetention);
    mockUpdateRetention = jest.mocked(updateRetention);
    mockGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockGetEventProperties = jest.mocked(getEventProperties);
    mockConvertToTrendsData = jest.mocked(convertToTrendsData);
    mockConvertToCohortData = jest.mocked(convertToCohortData);
    mockConvertToIntervalData = jest.mocked(convertToIntervalData);

    mockGetSavedSegmentsForDatasourceId = jest.mocked(
      getSavedSegmentsForDatasourceId
    );
    mockHasValidRetentionEventAndFilters = jest.mocked(
      hasValidRetentionEventAndFilters
    );
    mockSubstituteEmptyStringWithPlaceholder = jest.mocked(
      substituteEmptyStringWithPlaceholder
    );

    mockGetTransientRetentionData.mockReturnValue(retentionData);
    mockedHasValidEvents.mockReturnValue(true);
    mockHasValidRetentionEventAndFilters.mockReturnValue(true);
    mockGetEventProperties.mockReturnValue(eventProperties);
    mockGetEventPropertiesValue.mockReturnValue(eventPropertiesValues);
    mockSubstituteEmptyStringWithPlaceholder.mockImplementation((val: any) => {
      return val;
    });
    mockConvertToTrendsData.mockReturnValue(retentionTrendsData);
    mockConvertToIntervalData.mockReturnValue(retentionIntervalData);
    mockConvertToCohortData.mockReturnValue(retetentionCohortData);
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
    });
  });

  describe('change datatype of filter', () => {
    it('should change the filter from string datatype to number', async () => {
      await renderRetention();

      const startEvent = screen.getAllByTestId('event-selection')[0];
      fireEvent.click(startEvent);
      await addEvent('Video_Click');

      await addEventFilter('city');

      const eventFilter = screen.getByTestId('event-filter');
      fireEvent.mouseEnter(eventFilter);

      const filterDatatypeOption = screen.getByTestId('filter-datatype-option');
      fireEvent.click(filterDatatypeOption);

      const datatypeText = screen.getByText('Data Type');
      fireEvent.mouseEnter(datatypeText);

      const numberDataType = screen.getByText('Number');
      await act(async () => {
        fireEvent.click(numberDataType);
      });

      const filterOperator = screen.getByTestId('filter-operator');
      const filterValueInput = screen.queryByTestId('filter-value-input');

      // upon changing datatype to number, default operator 'equals' should be selected
      // and input field should be visible
      expect(filterOperator.textContent).toBe('equals');
      expect(filterValueInput).toBeVisible();
    });

    it('should change the filter from string datatype to bool, should not see any option to select filter value', async () => {
      await renderRetention();

      const startEvent = screen.getAllByTestId('event-selection')[0];
      fireEvent.click(startEvent);
      await addEvent('Video_Click');

      await addEventFilter('city');

      const eventFilter = screen.getByTestId('event-filter');
      fireEvent.mouseEnter(eventFilter);

      const filterDatatypeOption = screen.getByTestId('filter-datatype-option');
      fireEvent.click(filterDatatypeOption);

      const datatypeText = screen.getByText('Data Type');
      fireEvent.mouseEnter(datatypeText);

      const boolDatatype = screen.getByText('True/ False');
      await act(async () => {
        fireEvent.click(boolDatatype);
      });

      const filterOperator = screen.getByTestId('filter-operator');
      const filterValueInput = screen.queryByTestId('filter-value-input');
      const filterValuesDropdown = screen.queryByTestId('filter-values');

      // upon changing datatype to bool, default operator  should be selected
      // and input field should be hidden as well as the select dropdown
      expect(filterOperator.textContent).toBe('is true');
      expect(filterValueInput).not.toBeInTheDocument();
      expect(filterValuesDropdown).not.toBeInTheDocument();
    });
  });

  describe('switch operator values', () => {
    it('should show input field for string datatype when switch operator from `is` to `contains`', async () => {
      await renderRetention();

      const startEvent = screen.getAllByTestId('event-selection')[0];
      fireEvent.click(startEvent);
      await addEvent('Video_Click');

      await addEventFilter('city');

      const filterOperatorText = screen.getByTestId('filter-operator');
      fireEvent.click(filterOperatorText);

      const filterOperatorsOptions = screen.getAllByTestId(
        'filter-operators-options'
      );

      const filterOperatorsOptionsText = filterOperatorsOptions.map(
        (filter) => filter.textContent
      );
      expect(filterOperatorsOptionsText).toEqual([
        'Is',
        'Is not',
        'Contains',
        'Does not contain',
      ]);

      // click on 'Is not' operator
      await act(async () => {
        fireEvent.click(filterOperatorsOptions[1]);
      });
      await waitFor(() => {
        expect(filterOperatorText.textContent).toEqual('is not');
      });

      fireEvent.click(filterOperatorText);
      const newFilterOperatorsOptions = screen.getAllByTestId(
        'filter-operators-options'
      );
      // click on 'Contains' operator and check if Input Field is visible
      await act(async () => {
        fireEvent.click(newFilterOperatorsOptions[2]);
      });

      await waitFor(() => {
        const filterOperatorText = screen.getByTestId('filter-operator');
        expect(filterOperatorText.textContent).toEqual('contains');
        const inputField = screen.getByTestId('filter-value-input');
        expect(inputField).toBeVisible();
      });
    });
  });

  describe('cohort table ', () => {
    it('should display cohort table with retention data', async () => {
      await renderRetention();

      const cohortTable = screen.getByTestId('cohort-table');
      expect(cohortTable).toBeInTheDocument();

      const cohortTableBodyRows = screen.getAllByTestId(
        'cohort-table-body-rows'
      );
      expect(cohortTableBodyRows.length).toEqual(3);

      const cohortTableBodyHeaders = screen.getAllByTestId(
        'cohort-table-headers'
      );
      expect(cohortTableBodyHeaders.length).toEqual(5);

      const cohortTableBodyData = screen.getAllByTestId(
        'cohort-table-body-data'
      );
      expect(cohortTableBodyData.length).toEqual(15);
    });
  });
});
