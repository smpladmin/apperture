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
import { MetricComponentVariant } from '@lib/domain/metric';

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/services/metricService');

describe('View Metric', () => {
  let mockedGetEventProperties: jest.Mock;
  let mockedGetNodes: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;
  let mockedComputedMetric: jest.Mock;
  //   let mockedGetUserInfo: jest.Mock;
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

  const savedMetric = {
    _id: '63db5e23ef0cac7d5da46c79',
    createdAt: '2023-02-02T06:54:27.463000',
    updatedAt: '2023-02-02T07:29:37.184000',
    datasourceId: '63d8ef5a7b02dbd1dcf20dcc',
    appId: '63d8ef4f7b02dbd1dcf20dca',
    userId: '63d38ec3071bbcb1c8b04ab8',
    user: {
      firstName: 'Aditya',
      lastName: 'Priyam',
      email: 'aditya@parallel.com',
      picture: 'string',
      slackChannel: null,
    },
    name: 'Test Metric',
    function: 'A+B/C',
    aggregates: [
      {
        variable: 'A',
        function: 'count',
        variant: MetricComponentVariant.EVENT,
        aggregations: { functions: 'count', property: 'Name_Added' },
        reference_id: 'Name_Added',
        filters: [],
        conditions: [],
      },
      {
        variable: 'B',
        function: 'count',
        variant: MetricComponentVariant.EVENT,
        aggregations: { functions: 'count', property: 'Opened_Popular' },
        reference_id: 'Opened_Popular',
        filters: [],
        conditions: [],
      },
      {
        variable: 'C',
        function: 'count',
        variant: MetricComponentVariant.EVENT,
        aggregations: { functions: 'count', property: 'Topic_Click' },
        reference_id: 'Topic_Click',
        filters: [],
        conditions: [],
      },
    ],
    breakdown: [],
  };

  beforeEach(() => {
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetNodes = jest.mocked(getNodes);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedComputedMetric = jest.mocked(computeMetric);
    // mockedGetUserInfo = jest.mocked(getAppertureUserInfo);

    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetNodes.mockReturnValue(events);
    mockedGetEventPropertiesValue.mockReturnValue([
      ['android'],
      ['ios'],
      ['mac'],
      ['windows'],
    ]);
    mockedComputedMetric.mockReturnValue(computedMetricResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('show the alert modal on set alert button click', () => {
    it('show the alert modal on set alert button click', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '' } })}
          >
            <ViewMetric savedMetric={savedMetric} />
          </RouterContext.Provider>
        );
      });
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
