import {
  fireEvent,
  render,
  screen,
  act,
  waitFor,
} from '@testing-library/react';
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
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import CreateMetric from './index';
import {
  isValidAggregates,
  convertToTableData,
  convertToTrendData,
  getCountOfValidAggregates,
  getDisplayAggregationFunctionText,
  enableBreakdown,
  checkMetricDefinitionAndAggregateCount,
  isEveryCustomSegmentFilterValid,
  getSelectedSegmentsText,
} from '../util';
// import { capitalizeFirstLetter } from '@lib/utils/common';

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/services/metricService');
jest.mock('@lib/services/segmentService');
jest.mock('../util');
// jest.mock('@lib/utils/common');

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
  let mockedEnableBreakdown: jest.Mock;
  let mockedCheckMetricDefinitionAndAggregateCount: jest.Mock;
  let mockedIsEveryCustomSegmentFilterValid: jest.Mock;
  let mockedGetSavedSegmentsForDatasourceId: jest.Mock;
  let mockedGetSelectedSegmentsText: jest.Mock;
  let mockedCapitalizeLetter: jest.Mock;

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

  const savedSegments = [
    {
      _id: '63d0feda2f4dd4305186cdfa',
      createdAt: '2023-01-25T10:05:14.446000',
      updatedAt: '2023-01-25T10:05:14.446000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'Segment 1',
      description: '',
      groups: [
        {
          filters: [
            {
              operand: 'properties.$city',
              operator: 'is',
              values: ['Hyderabad', 'Delhi', 'Mumbai', 'Jaipur'],
              all: false,
              condition: 'where',
              datatype: 'String',
              type: 'where',
            },
            {
              operand: 'Mobile_Number_Added',
              operator: 'equals',
              values: ['1'],
              triggered: true,
              aggregation: 'total',
              date_filter: {
                days: 30,
              },
              date_filter_type: 'last',
              condition: 'who',
              type: 'who',
              datatype: 'Number',
            },
          ],
          condition: 'and',
        },
      ],
      columns: ['user_id', 'properties.$city'],
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
      _id: '63d0feda2f4dd4305186cdfb',
      createdAt: '2023-01-25T10:05:14.446000',
      updatedAt: '2023-01-25T10:05:14.446000',
      datasourceId: '63d0a7bfc636cee15d81f579',
      appId: '63ca46feee94e38b81cda37a',
      userId: '6374b74e9b36ecf7e0b4f9e4',
      name: 'Segment 2',
      description: '',
      groups: [
        {
          filters: [
            {
              operand: 'properties.$city',
              operator: 'is',
              values: ['Hyderabad', 'Delhi', 'Mumbai', 'Jaipur'],
              all: false,
              condition: 'where',
              datatype: 'String',
              type: 'where',
            },
          ],
          condition: 'and',
        },
      ],
      columns: ['user_id', 'properties.$city'],
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
    const eventOption = screen.getByTestId('event-option');
    fireEvent.click(eventOption);

    const SELECTED_OPTION = 1;
    // Selecting an event from the dropdown
    const eventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(eventNameDropdownList[SELECTED_OPTION]);
    });
  };

  const addFilter = async (option = 1) => {
    const eventPropertyDropdownList = screen.getAllByTestId('dropdown-options');
    await act(async () => {
      fireEvent.click(eventPropertyDropdownList[option]);
    });

    const eventFilterValue = screen.getByTestId('event-filter-values');

    expect(eventFilterValue.textContent).toEqual('Select value');

    const eventPropertyValueDropdownList = screen.getAllByTestId(
      'property-value-dropdown-option'
    );
    const addPropertyValueButton = screen.getByTestId(
      'add-event-property-values'
    );
    await act(async () => {
      fireEvent.click(eventPropertyValueDropdownList[option]);
      fireEvent.click(addPropertyValueButton);
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
    // mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedGetDisplayAggregationFunctionText = jest.mocked(
      getDisplayAggregationFunctionText
    );
    mockedEnableBreakdown = jest.mocked(enableBreakdown);
    mockedGetSavedSegmentsForDatasourceId = jest.mocked(
      getSavedSegmentsForDatasourceId
    );
    mockedIsEveryCustomSegmentFilterValid = jest.mocked(
      isEveryCustomSegmentFilterValid
    );
    mockedCheckMetricDefinitionAndAggregateCount = jest.mocked(
      checkMetricDefinitionAndAggregateCount
    );
    mockedGetSelectedSegmentsText = jest.mocked(getSelectedSegmentsText);

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
    mockedIsEveryCustomSegmentFilterValid.mockReturnValue(true);
    mockedCheckMetricDefinitionAndAggregateCount.mockReturnValue(true);
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
    mockedGetSavedSegmentsForDatasourceId.mockReturnValue(savedSegments);
    // mockedCapitalizeLetter.mockImplementation((val: string) => {
    //   const capitalizedFirstLetterMap: { [key: string]: string } = {
    //     equals: 'Equals',
    //     is: 'Is',
    //     'is not': 'Is not',
    //     total: 'Total',
    //     'is true': 'Is true',
    //     'is false': 'Is false',
    //     contains: 'Contains',
    //     'does not contain': 'Does not contain',
    //   };
    //   return capitalizedFirstLetterMap[val];
    // });
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

  describe('add/remove events and filter', () => {
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
      await addNewEvent();

      const addEventsOrSegmentsButton = screen.getByTestId('add-event-button');
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
      expect(EventsOrSegmentsVariablesList.map((el) => el.textContent)).toEqual(
        ['A', 'B']
      );
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
      await addNewEvent();

      const addEventsOrSegmentsButton = screen.getByTestId('add-event-button');
      const removeAggregate = screen.getByTestId('remove-aggregate');

      const EventsOrSegmentsList = screen.getAllByTestId(
        'event-or-segment-component'
      );
      await act(async () => {
        fireEvent.click(addEventsOrSegmentsButton);
      });

      await act(async () => {
        fireEvent.click(removeAggregate);
      });

      const newEventsOrSegmentsList = screen.getAllByTestId(
        'event-or-segment-component'
      );
      const EventsOrSegmentsVariablesList = screen.getAllByTestId(
        'event-or-segment-component-variable'
      );
      expect(EventsOrSegmentsList.length).toEqual(
        newEventsOrSegmentsList.length
      );
      expect(EventsOrSegmentsVariablesList.map((el) => el.textContent)).toEqual(
        ['A']
      );
    });

    it('should show event name, after selecting it from the dropdown list', async () => {
      await renderMetricComponent();

      const eventOption = screen.getByTestId('event-option');
      fireEvent.click(eventOption);
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
      await renderMetricComponent();

      await addNewEvent();
      const SELECTED_OPTION = 1;
      //Adding a filter to the "Event or Segment" Component
      const addFilterButton = screen.getAllByTestId('add-filter-button');
      fireEvent.click(addFilterButton[0]); // step add filter button
      const eventPropertyDropdownList =
        screen.getAllByTestId('dropdown-options');

      await act(async () => {
        fireEvent.click(eventPropertyDropdownList[SELECTED_OPTION]);
      });

      const eventFilterComponent = screen.getByTestId('event-filter');
      expect(eventFilterComponent).toBeInTheDocument();
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
      await addNewEvent();
      const SELECTED_OPTION = 1;

      //Adding a filter to the "Event or Segment" Component
      const addFilterButton = screen.getAllByTestId('add-filter-button');
      fireEvent.click(addFilterButton[0]); // step add filter button

      await addFilter(SELECTED_OPTION);

      const eventFilterValue = screen.getByTestId('event-filter-values');

      // option 1 is ios
      expect(eventFilterValue.textContent).toEqual('ios');
    });
  });

  describe('change datatype of filter', () => {
    it('should change the filter from string datatype to number', async () => {
      await renderMetricComponent();
      await addNewEvent();

      const addFilterButton = screen.getAllByTestId('add-filter-button');
      fireEvent.click(addFilterButton[0]); // step add filter button
      await addFilter();

      const eventFilter = screen.getByTestId('event-filter');
      fireEvent.mouseOver(eventFilter);

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
      await renderMetricComponent();
      await addNewEvent();

      const addFilterButton = screen.getAllByTestId('add-filter-button');
      fireEvent.click(addFilterButton[0]); // step add filter button
      await addFilter();

      const eventFilter = screen.getByTestId('event-filter');
      fireEvent.mouseOver(eventFilter);

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
      await renderMetricComponent();
      await addNewEvent();

      const addFilterButton = screen.getAllByTestId('add-filter-button');
      fireEvent.click(addFilterButton[0]); // step add filter button
      await addFilter();

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

  describe('enable/disable save button', () => {
    it('save button should be disabled if aggregates are not valid', async () => {
      mockedIsValidAggregates.mockReturnValue(false);
      await renderMetricComponent();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeDisabled();
    });

    it('save button should be disabled if aggregates are valid, but formula is not valid', async () => {
      mockedIsValidAggregates.mockReturnValue(true);
      mockedValidateMetricFormula.mockReturnValue(false);
      await renderMetricComponent();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeDisabled();
    });

    it('save button should be enabled if it has one aggregate and formula is valid', async () => {
      mockedIsValidAggregates.mockReturnValue(true);
      mockedValidateMetricFormula.mockReturnValue(true);
      mockedGetCountOfAggregates.mockReturnValue(1);
      await renderMetricComponent();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).not.toBeDisabled();
    });

    it('save button should be disabled if it has multiple aggregates and no metric definition', async () => {
      mockedCheckMetricDefinitionAndAggregateCount.mockReturnValue(false);
      mockedIsValidAggregates.mockReturnValue(true);
      mockedValidateMetricFormula.mockReturnValue(true);
      mockedGetCountOfAggregates.mockReturnValue(2);
      await renderMetricComponent();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeDisabled();
    });

    it('save button should be enabled if it has multiple aggregates and metric definition', async () => {
      mockedIsValidAggregates.mockReturnValue(true);
      mockedValidateMetricFormula.mockReturnValue(true);
      mockedGetCountOfAggregates.mockReturnValue(2);
      await renderMetricComponent();
      await addNewEvent();

      const addEventsOrSegmentsButton = screen.getByTestId('add-event-button');
      await act(async () => {
        fireEvent.click(addEventsOrSegmentsButton);
      });

      const metricFormulaInput = screen.getByTestId('metric-definition');
      await act(async () => {
        fireEvent.change(metricFormulaInput, { target: { value: 'A/B' } });
      });
      await waitFor(() => {
        const saveButton = screen.getByTestId('save');
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('metric breakdown', () => {
    it('should be able to add metric breakdown', async () => {
      mockedEnableBreakdown.mockReturnValue(true);
      await renderMetricComponent();

      const selectBreakdownButton = screen.getByTestId('add-breakdown');
      fireEvent.click(selectBreakdownButton);

      const SELECTED_OPTION = 0; // city
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[SELECTED_OPTION]);
      });

      const breakdownName = screen.getByTestId('breakdown-name');
      expect(breakdownName.textContent).toEqual('city');
    });

    it('should be able to remove metric breakdown', async () => {
      mockedEnableBreakdown.mockReturnValue(true);
      await renderMetricComponent();

      const selectBreakdownButton = screen.getByTestId('add-breakdown');
      fireEvent.click(selectBreakdownButton);

      const SELECTED_OPTION = 0; // city
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[SELECTED_OPTION]);
      });

      const breakdownName = screen.getByTestId('breakdown-name');
      expect(breakdownName.textContent).toEqual('city');

      fireEvent.mouseEnter(breakdownName);

      const removeMetricBreakdown = screen.getByTestId('remove-breakdown');
      await act(async () => {
        fireEvent.click(removeMetricBreakdown);
      });
      await waitFor(() => {
        const breakdownName = screen.queryByTestId('breakdown-name');
        expect(breakdownName).not.toBeInTheDocument();
      });
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
      const selectBreakdownButton = screen.getByTestId('add-breakdown');
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

  describe('segment filter', () => {
    it('should add a segment filter with includes option', async () => {
      mockedGetSelectedSegmentsText.mockReturnValue(
        'Includes Segment1, Segment2'
      );

      await renderMetricComponent();
      await addNewEvent();

      const segmentFilterText = screen.getByTestId('segment-filter-text');
      fireEvent.click(segmentFilterText);

      const segmentDrodpdownOptions = screen.getAllByTestId(
        'saved-segment-options'
      );

      const segmentOptionsText = Array.from(segmentDrodpdownOptions).map(
        (option) => option.textContent
      );

      expect(segmentOptionsText).toEqual(['Segment 1', 'Segment 2']);

      const selectAllCheckBox = screen.getByTestId('select-all-checkbox');
      fireEvent.click(selectAllCheckBox);

      await act(async () => {
        const addSelectedSegments = screen.getByTestId('select-segments');
        fireEvent.click(addSelectedSegments);
      });

      const segmentFilterTextAfterSelectingSegments = screen.getByTestId(
        'segment-filter-text'
      );

      expect(segmentFilterTextAfterSelectingSegments.textContent).toEqual(
        'Includes Segment1, Segment2'
      );
    });

    it('should add a segment filter with excludes option', async () => {
      mockedGetSelectedSegmentsText.mockReturnValue(
        'Excludes Segment1, Segment2'
      );

      await renderMetricComponent();
      await addNewEvent();

      const segmentFilterText = screen.getByTestId('segment-filter-text');
      fireEvent.click(segmentFilterText);

      const excludeUserOption = screen.getByText('Exclude Users');
      fireEvent.click(excludeUserOption);

      const selectAllCheckBox = screen.getByTestId('select-all-checkbox');
      fireEvent.click(selectAllCheckBox);

      await act(async () => {
        const addSelectedSegments = screen.getByTestId('select-segments');
        fireEvent.click(addSelectedSegments);
      });

      const segmentFilterTextAfterSelectingSegments = screen.getByTestId(
        'segment-filter-text'
      );

      expect(segmentFilterTextAfterSelectingSegments.textContent).toEqual(
        'Excludes Segment1, Segment2'
      );
    });

    it('should add a new custom filter in segment group', async () => {
      await renderMetricComponent();
      await addNewEvent();

      const addFilterButton = screen.getAllByTestId('add-filter-button');
      fireEvent.click(addFilterButton[1]); // segment filter add filter button

      const SELECT_OPTION = 1;

      await addFilter(SELECT_OPTION);
      const eventFilterValue = screen.getByTestId('event-filter-values');

      // option 1 is ios
      expect(eventFilterValue.textContent).toEqual('ios');
    });
  });
});
