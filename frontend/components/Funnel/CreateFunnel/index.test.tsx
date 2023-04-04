import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import React from 'react';
import {
  getCountOfValidAddedSteps,
  transformFunnelData,
  isEveryFunnelStepFiltersValid,
  replaceFilterValueWithEmptyStringPlaceholder,
} from '../util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import CreateFunnel from './index';
import { createMockRouter } from 'tests/util';
import * as APIService from '@lib/services/funnelService';
import {
  capitalizeFirstLetter,
  getSearchResult,
  getFilterValuesText,
  trimLabel,
} from '@lib/utils/common';
import {
  getEventProperties,
  getEventPropertiesValue,
} from '@lib/services/datasourceService';
import { MapContext } from '@lib/contexts/mapContext';
import { Funnel } from '@lib/domain/funnel';
import { Node } from '@lib/domain/node';

jest.mock('../util');
jest.mock('@lib/services/funnelService');
jest.mock('@lib/utils/common');
jest.mock('@lib/services/datasourceService');

describe('create funnel', () => {
  let mockedGetCountOfValidAddedSteps: jest.Mock;
  let mockedSearchResult: jest.Mock;
  let mockedIsEveryFunnelStepFiltersValid: jest.Mock;
  let mockedTransformFunnelData: jest.Mock;
  let mockedGetTransientFunnelData: jest.Mock;
  let mockedSaveFunnel: jest.Mock;
  let mockUpdateFunnel: jest.Mock;
  let mockedGetEventProperties: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;
  let mockedReplaceFilterValueWithEmptyStringPlaceholder: jest.Mock;
  let mockedGetTransientFunnelTrendsData: jest.Mock;
  let mockedCapitalizeLetter: jest.Mock;
  let mockedGetFilterValueText: jest.Mock;
  let mockedTrimLabel: jest.Mock;

  const eventProperties = [
    'city',
    'device',
    'country',
    'app_version',
    'session_length',
  ];
  const eventPropertiesValues = [
    ['Mumbai'],
    ['Delhi'],
    ['Kolkata'],
    ['Bengaluru'],
  ];

  const computedFunnel = {
    _id: '64834034092324',
    appId: '645439584475',
    datasourceId: '654212033222',
    name: 'Test Funnel',
    steps: [
      { event: 'Video_Click', filters: [] },
      { event: 'Chapter_Click', filters: [] },
      { event: 'Topic_Click', filters: [] },
    ],
    computedFunnel: [
      { step: 1, event: 'Video_Click', users: 2000, conversion: 100, drop: 0 },
      { step: 2, event: 'Chapter_Click', users: 950, conversion: 75, drop: 25 },
      { step: 3, event: 'Topic_Click', users: 750, conversion: 50, drop: 25 },
    ],
    randomSequence: false,
  };

  const computedTrendsData = [
    {
      conversion: 23.1,
      startDate: new Date('2022-10-11'),
      endDate: new Date('2022-10-17'),
      firstStepUsers: 49,
      lastStepUsers: 8,
    },
  ];

  const getEventFilterText = (eventFilters: HTMLElement[], index: number) => {
    return Array.from(eventFilters[index].getElementsByTagName('p')).map(
      (el) => el.textContent
    );
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
    const selectCityValue = screen.getByText('Select all');
    fireEvent.click(selectCityValue);
    await act(async () => {
      fireEvent.click(addFilterValueButton);
    });
  };

  const addEvent = async (eventName: string) => {
    const selectElementByText = screen.getByText(eventName);

    await act(async () => {
      fireEvent.click(selectElementByText);
    });
  };

  const props: Funnel = {
    _id: '64834034092324',
    appId: '645439584475',
    datasourceId: '654212033222',
    name: 'Test Funnel',
    steps: [
      { event: 'Video_Click', filters: [] },
      { event: 'Chapter_Click', filters: [] },
      { event: 'Topic_Click', filters: [] },
    ],
    updatedAt: new Date(),
    randomSequence: false,
  };

  const renderCreateFunnel = async (
    router = createMockRouter({
      pathname: '/analytics/funnel/create',
      query: { dsId: '654212033222' },
    }),
    renderWithProps = false,
    savedFunnel = props
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <MapContext.Provider
            value={{
              state: {
                nodes: [
                  { id: 'Video_Click', name: 'Video_Click' },
                  { id: 'Chapter_Click', name: 'Video_Click' },
                  { id: 'Topic_Click', name: 'Video_Click' },
                ] as Node[],
                nodesData: [],
                activeNode: null,
                isNodeSearched: false,
              },
              dispatch: () => {},
            }}
          >
            {renderWithProps ? (
              <CreateFunnel savedFunnel={savedFunnel} />
            ) : (
              <CreateFunnel />
            )}
          </MapContext.Provider>
        </RouterContext.Provider>
      );
    });
  };

  const funnelTrendsData = [
    {
      conversion: 5.19,
      firstStepUsers: 578,
      lastStepUsers: 30,
      startDate: '2022-11-21T00:00:00',
      endDate: '2022-11-27T00:00:00',
    },
    {
      conversion: 5.11,
      firstStepUsers: 978,
      lastStepUsers: 50,
      startDate: '2022-11-28T00:00:00',
      endDate: '2022-12-04T00:00:00',
    },
  ];
  beforeEach(() => {
    mockedGetCountOfValidAddedSteps = jest.mocked(getCountOfValidAddedSteps);
    mockedSearchResult = jest.mocked(getSearchResult);
    mockedTransformFunnelData = jest.mocked(transformFunnelData);
    mockedGetTransientFunnelData = jest.mocked(
      APIService.getTransientFunnelData
    );
    mockedGetTransientFunnelTrendsData = jest.mocked(
      APIService.getTransientTrendsData
    );
    mockedSaveFunnel = jest.mocked(APIService.saveFunnel);
    mockUpdateFunnel = jest.mocked(APIService.updateFunnel);
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedIsEveryFunnelStepFiltersValid = jest.mocked(
      isEveryFunnelStepFiltersValid
    );
    mockedReplaceFilterValueWithEmptyStringPlaceholder = jest.mocked(
      replaceFilterValueWithEmptyStringPlaceholder
    );
    mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedGetFilterValueText = jest.mocked(getFilterValuesText);
    mockedTrimLabel = jest.mocked(trimLabel);

    mockedGetTransientFunnelTrendsData.mockReturnValue(funnelTrendsData);
    mockedGetCountOfValidAddedSteps.mockReturnValue(2);
    mockedIsEveryFunnelStepFiltersValid.mockReturnValue(true);
    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetEventPropertiesValue.mockReturnValue(eventPropertiesValues);
    mockedCapitalizeLetter.mockImplementation((val: string) => {
      const capitalizedFirstLetterMap: { [key: string]: string } = {
        days: 'Days',
        minutes: 'Minutes',
      };
      return capitalizedFirstLetterMap[val];
    });
    mockedGetFilterValueText.mockImplementation((values: string[]) => {
      if (!values.length) return 'Select value';
      if (values.length <= 2) return values.join(', ');
      return `${values[0]}, ${values[1]}, +${values.length - 2} more`;
    });
    mockedTrimLabel.mockImplementation((label: string, size = 15) => {
      return label.length > size + 3 ? label.slice(0, size) + '...' : label;
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => jest.clearAllMocks());

  describe('create funnel action', () => {
    it('save button is rendered and disabled when steps are not valid', async () => {
      mockedIsEveryFunnelStepFiltersValid.mockReturnValue(false);
      await renderCreateFunnel();
      const saveButton = screen.getByTestId('save');

      expect(saveButton).toBeDisabled();
      expect(saveButton).toBeInTheDocument();
    });

    it('save button should get enabled when two valid steps are added', async () => {
      mockedIsEveryFunnelStepFiltersValid.mockReturnValue(true);
      await renderCreateFunnel();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeEnabled();
      expect(saveButton).toBeInTheDocument();
    });

    it('adds new funnel step on click of + button', async () => {
      await renderCreateFunnel();

      const addButton = screen.getByTestId('add-button');
      const funnelSteps = screen.getAllByTestId('funnel-step');

      await act(async () => {
        fireEvent.click(addButton);
      });

      const newAddedFunnelSteps = screen.getAllByTestId('funnel-step');
      expect(newAddedFunnelSteps.length).toEqual(funnelSteps.length + 1);
    });

    it('remove button should not be rendered on screen when there are only two funnel steps', async () => {
      await renderCreateFunnel();

      const funnelSteps = screen.getAllByTestId('funnel-step');
      fireEvent.mouseEnter(funnelSteps[0]);
      const removeButton = screen.queryByTestId('remove-funnel-step-0');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('removes input field on click of cross button', async () => {
      await renderCreateFunnel();

      const funnelSteps = screen.getAllByTestId('funnel-step');
      const addButton = screen.getByTestId('add-button');

      // add input field to render cross icon because
      // cross button would be rendered if there are more than two input
      await act(async () => {
        fireEvent.click(addButton);
      });
      fireEvent.mouseEnter(funnelSteps[1]);
      const removeButton = screen.getByTestId('remove-funnel-step-2');

      await act(async () => {
        fireEvent.click(removeButton);
      });

      const newAddedFunnelSteps = screen.getAllByTestId('funnel-step');
      expect(newAddedFunnelSteps.length).toEqual(funnelSteps.length);
    });
  });

  describe('save/update funnel', () => {
    const router = createMockRouter({
      query: { dsId: '654212033222' },
      pathname: '/analytics/funnel/create',
    });

    it('should be able to save funnel when atleast two valid events are added', async () => {
      mockedSearchResult.mockReturnValue([{ id: 'Chapter_Click' }]);
      mockedSaveFunnel.mockReturnValue({
        status: 200,
        data: {
          _id: '64349843748',
          datasourceId: '654212033222',
          steps: [
            { event: 'Video_Click', filters: [] },
            { event: 'Chapter_Click', filters: [] },
          ],
        },
      });

      await renderCreateFunnel(router);
      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/funnel/view/[funnelId]',
          query: { funnelId: '64349843748', dsId: '654212033222' },
        });
      });
    });

    it('should not be redirected to funnel page if save funnel case fails', async () => {
      mockedSaveFunnel.mockReturnValue({
        status: 500,
        data: {},
      });

      await renderCreateFunnel();

      const saveButton = screen.getByTestId('save');
      const eventName = screen.getAllByTestId('event-name');

      fireEvent.click(eventName[0]);
      await addEvent('Video_Click');

      fireEvent.click(eventName[1]);
      await addEvent('Chapter_Click');

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledTimes(0);
      });
    });

    it('should update the funnel when click on save button on edit page', async () => {
      mockedSearchResult.mockReturnValue([{ id: 'Chapter_Click' }]);
      mockedReplaceFilterValueWithEmptyStringPlaceholder.mockReturnValue(
        computedFunnel.steps
      );

      mockUpdateFunnel.mockReturnValue({
        status: 200,
        datasourceId: '654212033222',
        steps: [
          { event: 'Video_Click', filters: [] },
          { event: 'Chapter_Click', filters: [] },
        ],
      });

      const router = createMockRouter({
        query: { dsId: '654212033222', funnelId: '64349843748' },
        pathname: '/analytics/funnel/edit',
      });

      await renderCreateFunnel(router);

      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateFunnel).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/funnel/view/[funnelId]',
          query: { funnelId: '64349843748', dsId: '654212033222' },
        });
      });
    });
  });

  describe('search ', () => {
    it('should show searchable dropdown and be able to search and select search result and update the event name for step', async () => {
      const searchResults = [{ id: 'Chapter_Click' }, { id: 'Chapter_Open' }];
      mockedSearchResult.mockReturnValue(searchResults);
      await renderCreateFunnel();

      const eventName = screen.getAllByTestId('event-name');

      fireEvent.click(eventName[0]);
      const searchInput = screen.getByTestId('dropdown-search-input');

      fireEvent.change(searchInput, { target: { value: 'Chapter' } });
      const dropdownOptionsAfterSearch =
        screen.getAllByTestId('dropdown-options');

      dropdownOptionsAfterSearch.forEach((dropdownOption, i) => {
        expect(dropdownOption).toHaveTextContent(searchResults[i]['id']);
      });
      await act(async () => {
        fireEvent.click(dropdownOptionsAfterSearch[0]);
      });
      await waitFor(() =>
        expect(eventName[0].textContent).toEqual('Chapter_Click')
      );
    });
  });

  describe('view funnel empty state /funnelchart', () => {
    it('should render empty state initially when there are no or less than 2 valid events for creating funnel', async () => {
      mockedGetCountOfValidAddedSteps.mockReturnValue(0);
      await renderCreateFunnel();
      const emptyFunnelState = screen.getByTestId('funnel-empty-state');
      expect(emptyFunnelState).toBeInTheDocument();
    });

    it('should  paint the funnel chart/ trend chart when you select atleast two valid events', async () => {
      mockedGetTransientFunnelData.mockReturnValue([
        { event: 'Video_Click', users: 2000, conversion: 100 },
        { event: 'Chapter_Click', users: 1000, conversion: 50 },
      ]);
      mockedSearchResult.mockReturnValue([{ id: 'Chapter_Click' }]);
      mockedTransformFunnelData.mockReturnValue([
        { event: ' Video_Click', users: 2000, conversion: 100 },
        { event: '  Chapter_Click', users: 1000, conversion: 50 },
      ]);

      await renderCreateFunnel();

      const eventName = screen.getAllByTestId('event-name');

      fireEvent.click(eventName[0]);
      await addEvent('Video_Click');

      fireEvent.click(eventName[1]);
      await addEvent('Chapter_Click');

      await waitFor(() => {
        const chart = screen.getByTestId('funnel-chart');
        const trendChart = screen.getByTestId('funnel-trend');
        const funnelConversion = screen.getByTestId('funnel-conversion');

        expect(chart).toBeInTheDocument();
        expect(trendChart).toBeInTheDocument();
        expect(funnelConversion).toBeInTheDocument();
      });
    });
  });

  describe('edit funnel flow - when props are passed to component', () => {
    it('should render prefil funnel name with passed prop name and have input fields equal to steps length passed in props', async () => {
      mockedReplaceFilterValueWithEmptyStringPlaceholder.mockReturnValue(
        computedFunnel.steps
      );
      const router = createMockRouter({
        query: { funnelid: '64349843748', dsId: '654212033222' },
        pathname: '/analytics/funnel/edit',
      });
      await renderCreateFunnel(router, true);
      const funnelName = screen.getByTestId('entity-name');
      const funnelSteps = screen.getAllByTestId('funnel-step');

      expect(funnelName).toHaveDisplayValue('Test Funnel');
      expect(funnelSteps.length).toEqual(props.steps.length);
    });
  });

  describe('add filters to funnel step', () => {
    it('add filter to funnel step', async () => {
      await renderCreateFunnel();

      const eventName = screen.getAllByTestId('event-name');
      fireEvent.click(eventName[0]);

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
      mockedGetEventPropertiesValue.mockReturnValue([
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
      await renderCreateFunnel();

      const eventName = screen.getAllByTestId('event-name');
      fireEvent.click(eventName[0]);

      await addEvent('Video_Click');

      await addEventFilter('city');

      // add another device filter
      mockedGetEventPropertiesValue.mockReturnValue([
        ['android'],
        ['ios'],
        ['mac'],
        ['windows'],
      ]);
      await addEventFilter('device');

      const eventFilters = screen.getAllByTestId('event-filter');
      fireEvent.mouseEnter(eventFilters[0]);

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

  describe('date filters on funnels', () => {
    it('should call transient call when date filter is selected', async () => {
      mockedGetTransientFunnelData.mockReturnValue([
        { event: 'Video_Click', users: 2000, conversion: 100 },
        { event: 'Chapter_Click', users: 1000, conversion: 50 },
      ]);
      await renderCreateFunnel();
      const eventName = screen.getAllByTestId('event-name');

      fireEvent.click(eventName[0]);
      await addEvent('Video_Click');

      fireEvent.click(eventName[1]);
      await addEvent('Chapter_Click');

      const oneMonthFilter = screen.getByTestId('month');
      await act(async () => {
        fireEvent.click(oneMonthFilter);
      });
      expect(mockedGetTransientFunnelData).toHaveBeenCalled();
    });
  });

  describe('Conversion Criteria', () => {
    it('should open up the list of conversion criteria and select minutes', async () => {
      await renderCreateFunnel();
      const conversionTypeList = screen.getByTestId('conversion-type-list');
      fireEvent.click(conversionTypeList);
      const minutesFunc = screen.getByText('Minutes');
      await act(async () => {
        fireEvent.click(minutesFunc);
      });
      const conversionType = screen.getByTestId('conversion-type');
      expect(conversionType.textContent).toEqual('Minutes');
    });

    it('should trigger an endpoint on changing input', async () => {
      await renderCreateFunnel();
      const conversionInput = screen.getByTestId('conversion-time-input');
      await act(async () => {
        fireEvent.change(conversionInput, { target: { value: 10 } });
      });
      expect(conversionInput).toHaveDisplayValue('10');
      expect(mockedGetTransientFunnelData).toHaveBeenCalled();
      expect(mockedGetTransientFunnelTrendsData).toHaveBeenCalled();
    });
  });
});
