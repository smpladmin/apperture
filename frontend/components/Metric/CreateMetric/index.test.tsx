import { fireEvent, render, screen, act } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import {
  getEventProperties,
  getEventPropertiesValue,
  getNodes,
} from '@lib/services/datasourceService';
import {
  computeMetric,
  validateMetricFormula,
} from '@lib/services/metricService';
import CreateMetric from './index';
import {
  isValidAggregates,
  convertToTableData,
  convertToTrendData,
  getCountOfValidAggregates,
  getDisplayAggregationFunctionText,
} from '../util';

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/services/metricService');
jest.mock('../util');

describe('Create Metric', () => {
  let mockedGetEventProperties: jest.Mock;
  let mockedGetNodes: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;
  let mockedComputedMetric: jest.Mock;
  let mockedIsValidAggregates: jest.Mock;
  let mockedGetCountOfAggregates: jest.Mock;
  let mockedValidateMetricFormula: jest.Mock;
  let mockedConvertToTableData: jest.Mock;
  let mockedConvertToTrendData: jest.Mock;
  let mockedGetDisplayAggregationFunctionText: jest.Mock;

  const eventProperties = [
    'city',
    'device',
    'country',
    'app_version',
    'session_length',
    'bluetooth_enabled',
  ];

  const events = [
    { id: 'App_Open', source: 'Mixpanel' },
    { id: 'Login', source: 'Mixpanel' },
    { id: 'Video_Open', source: 'Mixpanel' },
    { id: 'Video_Seen', source: 'Mixpanel' },
  ];

  const computedMetricResponse = {
    metric: [
      {
        date: '2022-10-07',
        value: 96,
      },
      {
        date: '2022-10-08',
        value: 135,
      },
      {
        date: '2022-10-09',
        value: 178,
      },
      {
        date: '2022-10-10',
        value: 190,
      },
      {
        date: '2022-10-11',
        value: 115,
      },
      {
        date: '2022-10-12',
        value: 126,
      },
    ],
  };

  const tableData = [
    {
      average: '0.42',
      name: 'A/B',
      propertyValue: '1',
      values: {
        'Nov 24': '0.23163841807909605',
        'Nov 25': '0.21395348837209302',
        'Nov 26': '0.38073394495412843',
        'Nov 27': '0.43636363636363634',
        'Nov 28': '0.8166666666666667',
      },
    },
    {
      average: '0.37',
      name: 'A/B',
      propertyValue: '0',
      values: {
        'Nov 24': '0.3619631901840491',
        'Nov 25': '0.3337531486146096',
        'Nov 26': '0.38153310104529614',
        'Nov 27': '0.354251012145749',
        'Nov 28': '0.4017543859649123',
      },
    },
  ];

  const trendData = [
    {
      date: '2022-11-24',
      series: 'A/B/0',
      value: 0.3619631901840491,
    },
    {
      date: '2022-11-25',
      series: 'A/B/0',
      value: 0.3337531486146096,
    },
    {
      date: '2022-11-26',
      series: 'A/B/0',
      value: 0.38153310104529614,
    },
    {
      date: '2022-11-27',
      series: 'A/B/0',
      value: 0.354251012145749,
    },
    {
      date: '2022-11-28',
      series: 'A/B/0',
      value: 0.4017543859649123,
    },
    {
      date: '2022-11-24',
      series: 'A/B/1',
      value: 0.23163841807909605,
    },
    {
      date: '2022-11-25',
      series: 'A/B/1',
      value: 0.21395348837209302,
    },
    {
      date: '2022-11-26',
      series: 'A/B/1',
      value: 0.38073394495412843,
    },
    {
      date: '2022-11-27',
      series: 'A/B/1',
      value: 0.43636363636363634,
    },
    {
      date: '2022-11-28',
      series: 'A/B/1',
      value: 0.8166666666666667,
    },
  ];

  const renderMetricComponent = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
  };

  const addNewEvent = async () => {
    const selectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(selectEvent);

    const eventOption = screen.getByTestId('event-option');
    fireEvent.click(eventOption);

    const SELECTED_OPTION = 1;
    // Selecting an event from the dropdown
    const eventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(eventNameDropdownList[SELECTED_OPTION]);
    });
  };

  beforeEach(() => {
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetNodes = jest.mocked(getNodes);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedComputedMetric = jest.mocked(computeMetric);
    mockedIsValidAggregates = jest.mocked(isValidAggregates);
    mockedGetCountOfAggregates = jest.mocked(getCountOfValidAggregates);
    mockedValidateMetricFormula = jest.mocked(validateMetricFormula);
    mockedConvertToTableData = jest.mocked(convertToTableData);
    mockedConvertToTrendData = jest.mocked(convertToTrendData);
    mockedGetDisplayAggregationFunctionText = jest.mocked(
      getDisplayAggregationFunctionText
    );

    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetNodes.mockReturnValue(events);
    mockedGetEventPropertiesValue.mockReturnValue([
      ['android'],
      ['ios'],
      ['mac'],
      ['windows'],
    ]);
    mockedComputedMetric.mockReturnValue(computedMetricResponse);
    mockedIsValidAggregates.mockReturnValue(true);
    mockedValidateMetricFormula.mockReturnValue(true);
    mockedGetCountOfAggregates.mockReturnValue(2);
    mockedConvertToTableData.mockReturnValue(tableData);
    mockedConvertToTrendData.mockReturnValue(trendData);
    mockedGetDisplayAggregationFunctionText.mockImplementation(
      (value: string) => {
        const metricAggregationDisplayText: { [key: string]: string } = {
          count: 'Total Count',
          unique: 'Unique Count',
          ap_sum: 'Sum',
          ap_median: 'Median',
          ap_average: 'Average',
          ap_distinct_count: 'Distinct Count',
          ap_min: 'Minimum',
          ap_max: 'Maximum',
          ap_p25: '25th Percentile',
          ap_p75: '75th Percentile',
          ap_p90: '90th Percentile',
          ap_p99: '99th Percentile',
        };
        return metricAggregationDisplayText[value];
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('render create metric component', () => {
    it('should render the metric component', async () => {
      mockedIsValidAggregates.mockReturnValue(false);

      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '' } })}
          >
            <CreateMetric />
          </RouterContext.Provider>
        );
      });
      const metricBackButton = screen.getByTestId('back-button');
      const metricSaveButton = screen.getByTestId('save');
      expect(metricBackButton).toBeInTheDocument();
      expect(metricSaveButton).toBeInTheDocument();
      expect(metricSaveButton).toBeDisabled();
    });
  });

  it('should add new EventsOrSegment Components on the click of + button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });
    const addEventsOrSegmentsButton = screen.getByTestId(
      'add-events-or-segments-button'
    );
    const EventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );

    await act(async () => {
      fireEvent.click(addEventsOrSegmentsButton);
    });
    const newEventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );
    expect(EventsOrSegmentsList.length + 1).toEqual(
      newEventsOrSegmentsList.length
    );
    const EventsOrSegmentsVariablesList = screen.getAllByTestId(
      'event-or-segment-component-variable'
    );
    expect(EventsOrSegmentsVariablesList.map((el) => el.textContent)).toEqual([
      'A',
      'B',
    ]);
  });

  it('should remove EventsOrSegment Components on the click of x button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });
    const addEventsOrSegmentsButton = screen.getByTestId(
      'add-events-or-segments-button'
    );
    const removeEventsOrSegmentsButton = screen.getByTestId(
      'remove-event-or-segment-component'
    );
    const EventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );
    await act(async () => {
      fireEvent.click(addEventsOrSegmentsButton);
    });

    await act(async () => {
      fireEvent.click(removeEventsOrSegmentsButton);
    });

    const newEventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );
    const EventsOrSegmentsVariablesList = screen.getAllByTestId(
      'event-or-segment-component-variable'
    );
    expect(EventsOrSegmentsList.length).toEqual(newEventsOrSegmentsList.length);
    expect(EventsOrSegmentsVariablesList.map((el) => el.textContent)).toEqual([
      'A',
    ]);
  });

  it('should show event name, after selecting it from the dropdown list', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const EventDropDown = screen.getByTestId(
      'event-property-dropdown-container'
    );
    const SELECTED_OPTION = 1;
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');
    expect(EventNameDropdownList.map((el) => el.textContent)).toEqual(
      events.map((event) => event.id)
    );
    expect(EventDropDown).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });
    const eventName = screen.getByTestId('event-or-segment-name');
    expect(eventName.textContent).toEqual(
      EventNameDropdownList[SELECTED_OPTION].textContent
    );
  });

  it('should add filter section after clicking on add filter button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });

    //Adding a filter to the "Event or Segment" Component
    const AddFilterButton = screen.getByTestId('add-filter-button');
    fireEvent.click(AddFilterButton);
    const EventPropertyDropdownList = screen.getAllByTestId('dropdown-options');
    await act(async () => {
      fireEvent.click(EventPropertyDropdownList[SELECTED_OPTION]);
    });
    const EventFilterComponent = screen.getByTestId('event-filter-component');
    expect(EventFilterComponent).toBeInTheDocument();
  });

  it('should be able to select value for the filter', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });

    //Adding a filter to the "Event or Segment" Component
    const AddFilterButton = screen.getByTestId('add-filter-button');
    fireEvent.click(AddFilterButton);
    const EventPropertyDropdownList = screen.getAllByTestId('dropdown-options');
    await act(async () => {
      fireEvent.click(EventPropertyDropdownList[SELECTED_OPTION]);
    });

    const EventFilterValue = screen.getByTestId('event-filter-values');

    expect(EventFilterValue.textContent).toEqual('Select value');
    fireEvent.click(EventFilterValue);

    const EventPropertyValueDropdownList = screen.getAllByTestId(
      'property-value-dropdown-option'
    );
    const AddPropertyValueButton = screen.getByTestId(
      'add-event-property-values'
    );
    await act(async () => {
      fireEvent.click(EventPropertyValueDropdownList[SELECTED_OPTION]);
      fireEvent.click(AddPropertyValueButton);
    });
    expect(EventFilterValue.textContent).toEqual(
      EventPropertyValueDropdownList[SELECTED_OPTION].textContent
    );
  });

  describe('enable/disable save button', () => {
    it('save button shoule be disabled if aggregates are not valid', async () => {
      mockedIsValidAggregates.mockReturnValue(false);
      await renderMetricComponent();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeDisabled();
    });

    it('save button shoule be disabled if aggregates are valid, but formula is not valid', async () => {
      mockedIsValidAggregates.mockReturnValue(true);
      mockedValidateMetricFormula.mockReturnValue(false);
      await renderMetricComponent();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeDisabled();
    });

    it('save button shoule be enabled if aggregates and formula are valid', async () => {
      mockedIsValidAggregates.mockReturnValue(true);
      mockedValidateMetricFormula.mockReturnValue(true);
      await renderMetricComponent();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('metric breakdown', () => {
    it('should be able to add metric breakdown', async () => {
      await renderMetricComponent();

      const selectBreakdownButton = screen.getByTestId('select-breakdown');
      fireEvent.click(selectBreakdownButton);

      const SELECTED_OPTION = 0; // city
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[SELECTED_OPTION]);
      });

      const breakdownName = screen.getByTestId('breakdown-name');
      expect(breakdownName.textContent).toEqual('Breakdown city');
    });

    it('should be able to remove metric breakdown', async () => {
      await renderMetricComponent();

      const selectBreakdownButton = screen.getByTestId('select-breakdown');
      fireEvent.click(selectBreakdownButton);

      const SELECTED_OPTION = 0; // city
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[SELECTED_OPTION]);
      });

      const breakdownName = screen.getByTestId('breakdown-name');
      expect(breakdownName.textContent).toEqual('Breakdown city');

      const removeMetricBreakdown = screen.getByTestId('remove-breakdown');
      await act(async () => {
        fireEvent.click(removeMetricBreakdown);
      });
      expect(breakdownName.textContent).toEqual('Breakdown ');
    });
  });

  describe('metric table', () => {
    it('should render table with breakdown columns', async () => {
      mockedConvertToTableData.mockReturnValue(tableData);
      await renderMetricComponent();

      await addNewEvent();

      const metricFormulaInput = screen.getByTestId('metric-definition');

      await act(async () => {
        fireEvent.change(metricFormulaInput, { target: { value: 'A/B' } });
      });

      // add breakdown
      const selectBreakdownButton = screen.getByTestId('select-breakdown');
      fireEvent.click(selectBreakdownButton);

      const SELECTED_OPTION = 5; // bluetooth_enabled
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[SELECTED_OPTION]);
      });

      const tableHeaders = screen.getAllByTestId('metric-table-headers');

      const tableHeadersText = [
        'Metric',
        'bluetooth_enabled',
        'Average',
        'Nov 24',
        'Nov 25',
        'Nov 26',
        'Nov 27',
        'Nov 28',
      ];

      tableHeaders.forEach((header, i) => {
        expect(header.textContent).toEqual(tableHeadersText[i]);
      });
    });
  });

  describe('metric aggregations', () => {
    it('Opens up the list of metric aggregations and select Unique Count', async () => {
      await renderMetricComponent();
      await addNewEvent();
      const aggregationFunctions = screen.getByTestId(
        'metric-aggregation-function'
      );
      fireEvent.click(aggregationFunctions);
      const uniqueFunc = screen.getByText('Unique Count');
      await act(async () => {
        fireEvent.click(uniqueFunc);
      });
      expect(aggregationFunctions.textContent).toEqual('Unique Count');
    });

    it('Opens up the list of metric aggregations and select Median Function which should give an option to select a property', async () => {
      await renderMetricComponent();
      await addNewEvent();
      const aggregationFunctions = screen.getByTestId(
        'metric-aggregation-function'
      );
      fireEvent.click(aggregationFunctions);
      const medianFunc = screen.getByText('Median');
      await act(async () => {
        fireEvent.click(medianFunc);
      });
      expect(aggregationFunctions.textContent).toEqual('Median');
      const eventProperty = screen.getByText('city');

      await act(async () => {
        fireEvent.click(eventProperty);
      });
      const metricAggEventProperties = screen.getByTestId(
        'metric-aggregation-event-property'
      );
      expect(metricAggEventProperties.textContent).toEqual('city');
    });
  });
});
