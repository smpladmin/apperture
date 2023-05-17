import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import * as APIService from '@lib/services/retentionService';
import { Granularity, Retention } from '@lib/domain/retention';
import {
  DateFilterType,
  FilterConditions,
  FilterDataType,
  FilterOperatorsString,
  FilterType,
} from '@lib/domain/common';
import { capitalizeFirstLetter, getFilterValuesText } from '@lib/utils/common';
import ViewRetention from './index';

jest.mock('@lib/services/retentionService');
jest.mock('@lib/utils/common');

describe('View Retention', () => {
  let mockedTransientRetention: jest.Mock;
  let mockedCapitalizeLetter: jest.Mock;
  let mockedGetFilterValueText: jest.Mock;

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

  const renderViewRetention = async (
    router = createMockRouter({ query: { retentionId: '64349843748' } }),
    savedRetention = props
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <ViewRetention savedRetention={savedRetention} />
        </RouterContext.Provider>
      );
    });
  };

  const { ResizeObserver } = window;

  beforeEach(() => {
    mockedTransientRetention = jest.mocked(
      APIService.getTransientRetentionData
    );
    mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedGetFilterValueText = jest.mocked(getFilterValuesText);

    mockedTransientRetention.mockReturnValue(retentionData);
    mockedCapitalizeLetter.mockImplementation((val: string) => {
      const capitalizedFirstLetterMap: { [key: string]: string } = {
        days: 'Days',
        weeks: 'Weeks',
        months: 'Months',
        mixpanel: 'Mixpanel',
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

  it('should render retention name, startEvent, goalEvent and filter', async () => {
    await renderViewRetention();
    const retentionName = screen.getByTestId('entity-name');
    const retentionEvent = screen.getAllByTestId('funnel-event');

    const eventNames = retentionEvent.map((ev) => ev.textContent);

    const firstStepFilter = screen.getAllByTestId('event-filter');
    const filterText = Array.from(
      firstStepFilter[0].getElementsByTagName('p')
    ).map((el) => el.textContent);

    expect(retentionName.textContent).toEqual('Test Retention');
    expect(eventNames).toEqual(['Video_Click', 'Chapter_Click']);
    expect(filterText).toEqual(['where ', 'city', 'is', 'Mumbai, Bengaluru']);
  });

  it('should render granularity text', async () => {
    await renderViewRetention();

    const retentionGranularity = screen.getByTestId('retention-granularity');
    expect(retentionGranularity.textContent).toEqual('Days');
  });

  it('should redirect user to edit page on click of edit retention button', async () => {
    const router = createMockRouter({
      query: { retentionId: '64349843748' },
      pathname: '/analytics/retention/view',
    });
    await renderViewRetention(router);

    const editRetentionButton = screen.getByTestId('edit');
    fireEvent.click(editRetentionButton);
    await waitFor(() => {
      expect(router.push).toBeCalledWith({
        pathname: '/analytics/retention/edit/[retentionId]',
        query: { retentionId: '64349843748', dsId: '654212033222' },
      });
    });
  });

  it('should render retention chart', async () => {
    await renderViewRetention();
    const trendsChart = screen.getByTestId('retention-trend');
    expect(trendsChart).toBeInTheDocument();
  });

  it('should render interval tabs', async () => {
    await renderViewRetention();

    const intervalBlock = screen.getByTestId('retention-interval-block');
    expect(intervalBlock).toBeInTheDocument();
    const intervalTabs = screen.getAllByTestId('interval-tab');
    expect(intervalTabs.length).toEqual(3);
    await act(async () => {
      fireEvent.click(intervalTabs[1]);
    });
  });
});
