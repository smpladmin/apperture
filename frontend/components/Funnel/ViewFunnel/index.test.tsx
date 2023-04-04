import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import ViewFunnel from './index';
import * as APIService from '@lib/services/funnelService';
import { Funnel, ConversionWindowList } from '@lib/domain/funnel';
import {
  NotificationChannel,
  NotificationMetricType,
  NotificationType,
  NotificationVariant,
} from '@lib/domain/notification';
import {
  FilterConditions,
  FilterDataType,
  FilterOperatorsString,
  FilterType,
} from '@lib/domain/common';
import { capitalizeFirstLetter, getFilterValuesText } from '@lib/utils/common';

jest.mock('@lib/services/funnelService');
jest.mock('@lib/utils/common');

describe('View Funnel', () => {
  let mockedTransientFunnel: jest.Mock;
  let mockedTransientTrendsData: jest.Mock;
  let mockedCapitalizeLetter: jest.Mock;
  let mockedGetFilterValueText: jest.Mock;

  const props: Funnel = {
    _id: '64834034092324',
    appId: '645439584475',
    datasourceId: '654212033222',
    name: 'Test Funnel',
    steps: [
      {
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
      { event: 'Chapter_Click', filters: [] },
      { event: 'Topic_Click', filters: [] },
    ],
    conversionWindow: {
      type: ConversionWindowList.DAYS,
      value: 30,
    },
    updatedAt: new Date(),
    randomSequence: false,
  };

  const funnelData = [
    {
      step: 1,
      event: 'Video_Click',
      users: 2000,
      conversion: 100,
      drop: 0,
    },
    {
      step: 2,
      event: 'Chapter_Click',
      users: 950,
      conversion: 75,
      drop: 25,
    },
    { step: 3, event: 'Topic_Click', users: 750, conversion: 50, drop: 25 },
  ];

  const trendsData = [
    {
      conversion: 23.1,
      startDate: new Date('2022-10-11'),
      endDate: new Date('2022-10-17'),
      firstStepUsers: 49,
      lastStepUsers: 8,
    },
  ];

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
      firstName: 'Test',
      lastName: 'Yuse',
      email: 'test@parallelhq.com',
      picture:
        'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
      slackChannel: null,
    },
  };

  const renderViewFunnel = async (
    router = createMockRouter({ query: { funnelId: '64349843748' } }),
    savedFunnel = props
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <ViewFunnel
            savedFunnel={savedFunnel}
            savedNotification={savedNotifications}
          />
        </RouterContext.Provider>
      );
    });
  };

  const { ResizeObserver } = window;

  beforeEach(() => {
    mockedTransientFunnel = jest.mocked(APIService.getTransientFunnelData);
    mockedTransientTrendsData = jest.mocked(APIService.getTransientTrendsData);
    mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedGetFilterValueText = jest.mocked(getFilterValuesText);

    mockedTransientFunnel.mockReturnValue(funnelData);
    mockedTransientTrendsData.mockReturnValue(trendsData);
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

  it('renders funnel name, steps and filter', async () => {
    await renderViewFunnel();
    const funnelName = screen.getByTestId('entity-name');
    const funnelEvent = screen.getAllByTestId('funnel-event');

    const eventNames = funnelEvent.map((ev) => ev.textContent);

    const firstStepFilter = screen.getAllByTestId('event-filter');
    const filterText = Array.from(
      firstStepFilter[0].getElementsByTagName('p')
    ).map((el) => el.textContent);

    expect(funnelName.textContent).toEqual('Test Funnel');
    expect(eventNames).toEqual(['Video_Click', 'Chapter_Click', 'Topic_Click']);
    expect(filterText).toEqual(['where ', 'city', 'is', 'Mumbai, Bengaluru']);
  });

  it('renders conversion criteria text', async () => {
    await renderViewFunnel();

    const conversionCriteria = screen.getByTestId('conversion-criteria');
    expect(conversionCriteria.textContent).toEqual('30 Days');
  });

  it('should redirect user to edit page on click of edit funnel button', async () => {
    const router = createMockRouter({
      query: { funnelId: '64349843748' },
      pathname: '/analytics/funnel/view',
    });
    await renderViewFunnel(router);

    const editFunnelButton = screen.getByTestId('edit');
    fireEvent.click(editFunnelButton);
    await waitFor(() => {
      expect(router.push).toBeCalledWith({
        pathname: '/analytics/funnel/edit/[funnelId]',
        query: { funnelId: '64349843748', dsId: '654212033222' },
      });
    });
  });

  it('should render funnel chart', async () => {
    const router = createMockRouter({
      query: { funnelId: '64349843748' },
      pathname: '/analytics/funnel/view',
    });
    await renderViewFunnel(router);

    const chart = screen.getByTestId('funnel-chart');
    const trendsChart = screen.getByTestId('funnel-trend');
    expect(chart).toBeInTheDocument();
    expect(trendsChart).toBeInTheDocument();
  });

  describe('show the alert modal on set alert button click', () => {
    it('show the alert modal on set alert button click', async () => {
      const router = createMockRouter({
        query: { funnelId: '64349843748' },
        pathname: '/analytics/funnel/view',
      });
      await renderViewFunnel(router);
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
