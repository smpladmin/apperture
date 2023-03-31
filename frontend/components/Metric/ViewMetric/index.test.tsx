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
import { computeMetric } from '@lib/services/metricService';
import ViewMetric from './index';
import {
  MetricBasicAggregation,
  MetricComponentVariant,
} from '@lib/domain/metric';
import {
  NotificationChannel,
  NotificationMetricType,
  NotificationType,
  NotificationVariant,
} from '@lib/domain/notification';
import { convertToTrendData } from '../util';
import {
  FilterConditions,
  FilterDataType,
  FilterOperatorsString,
  FilterType,
} from '@lib/domain/common';

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/services/metricService');
jest.mock('../util');

describe('View Metric', () => {
  let mockedGetEventProperties: jest.Mock;
  let mockedGetNodes: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;
  let mockedComputedMetric: jest.Mock;
  let mockedConvertToTrendData: jest.Mock;

  const eventProperties = [
    'city',
    'device',
    'country',
    'app_version',
    'session_length',
  ];

  const events = [
    { id: 'App_Open', source: 'Mixpanel' },
    { id: 'Login', source: 'Mixpanel' },
    { id: 'Video_Open', source: 'Mixpanel' },
    { id: 'Video_Seen', source: 'Mixpanel' },
  ];

  const computedMetricResponse = {
    metric: [],
  };

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

  const savedMetric = {
    _id: '63db5e23ef0cac7d5da46c79',
    createdAt: '2023-02-02T06:54:27.463000',
    updatedAt: '2023-02-02T07:29:37.184000',
    datasourceId: '63d8ef5a7b02dbd1dcf20dcc',
    appId: '63d8ef4f7b02dbd1dcf20dca',
    userId: '63d38ec3071bbcb1c8b04ab8',
    name: 'Test Metric',
    function: 'A+B/C',
    aggregates: [
      {
        variable: 'A',
        function: 'count',
        variant: MetricComponentVariant.EVENT,
        aggregations: {
          functions: MetricBasicAggregation.TOTAL,
          property: 'Name_Added',
        },
        reference_id: 'Name_Added',
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
        conditions: [],
      },
      {
        variable: 'B',
        function: 'count',
        variant: MetricComponentVariant.EVENT,
        aggregations: {
          functions: MetricBasicAggregation.TOTAL,
          property: 'Opened_Popular',
        },
        reference_id: 'Opened_Popular',
        filters: [],
        conditions: [],
      },
      {
        variable: 'C',
        function: 'count',
        variant: MetricComponentVariant.EVENT,
        aggregations: {
          functions: MetricBasicAggregation.TOTAL,
          property: 'Topic_Click',
        },
        reference_id: 'Topic_Click',
        filters: [],
        conditions: [],
      },
    ],
    breakdown: [],
  };

  const savedNotifications = {
    _id: '63dbc1e62effb8f88f60e240',
    createdAt: new Date('2023-02-02T14:00:06.464000'),
    datasourceId: '63d0a7bfc636cee15d81f579',
    userId: '6374b74e9b36ecf7e0b4f9e4',
    appId: '63ca46feee94e38b81cda37a',
    name: 'Funnel',
    notificationType: [NotificationType.ALERT],
    metric: NotificationMetricType.Users,
    multiNode: false,
    appertureManaged: false,
    pctThresholdActive: false,
    pctThresholdValues: null,
    absoluteThresholdActive: true,
    absoluteThresholdValues: {
      min: 75.52,
      max: 77.61,
    },
    formula: 'a',
    variableMap: {
      a: ['Funnel'],
    },
    preferredHourGmt: 5,
    frequency: 'daily',
    preferredChannels: [NotificationChannel.SLACK],
    notificationActive: true,
    variant: NotificationVariant.FUNNEL,
    reference: '63d36d10eb1e7db6cd4db69a',
    user: {
      firstName: 'Anish',
      lastName: 'Kaushal',
      email: 'anish@parallelhq.com',
      picture:
        'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
      slackChannel: null,
    },
  };

  beforeEach(() => {
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetNodes = jest.mocked(getNodes);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedComputedMetric = jest.mocked(computeMetric);
    mockedConvertToTrendData = jest.mocked(convertToTrendData);

    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetNodes.mockReturnValue(events);
    mockedGetEventPropertiesValue.mockReturnValue([
      ['android'],
      ['ios'],
      ['mac'],
      ['windows'],
    ]);
    mockedComputedMetric.mockReturnValue(computedMetricResponse);
    mockedConvertToTrendData.mockReturnValue(trendData);

    const { ResizeObserver } = window;
    // @ts-ignore
    delete window.ResizeObserver;
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  afterEach(() => {
    window.ResizeObserver = ResizeObserver;
    jest.clearAllMocks();
  });

  const renderMetric = async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <ViewMetric
            savedMetric={savedMetric}
            savedNotification={savedNotifications}
          />
        </RouterContext.Provider>
      );
    });
  };

  describe('render metric definition, events, filter, breakdown', () => {
    it('should render metric definition if present', async () => {
      await renderMetric();
      const metricDefinition = screen.getByTestId('metric-definition');
      expect(metricDefinition.textContent).toEqual('A+B/C');
    });

    it('renders metric event and filter', async () => {
      await renderMetric();
      const metricEvents = screen.getAllByTestId('metric-event');

      const eventNames = metricEvents.map((ev) => ev.textContent);

      const firstEventFilter = screen.getAllByTestId('event-filter');
      const filterText = Array.from(
        firstEventFilter[0].getElementsByTagName('p')
      ).map((el) => el.textContent);

      expect(eventNames).toEqual([
        'Name_Added',
        'Opened_Popular',
        'Topic_Click',
      ]);
      expect(filterText).toEqual(['where ', 'city', 'is', 'Mumbai, Bengaluru']);
    });
  });

  describe('show the alert modal on set alert button click', () => {
    it('show the alert modal on set alert button click', async () => {
      await renderMetric();
      const setAlertButton = screen.getByTestId('set-alert-button');
      expect(setAlertButton).toBeInTheDocument();
      fireEvent.click(setAlertButton);
      await waitFor(() => {
        const alertModal = screen.getByTestId('alerts-container');
        expect(alertModal).toBeInTheDocument();
      });
    });
  });
});
