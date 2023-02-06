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
import { Funnel } from '@lib/domain/funnel';

jest.mock('@lib/services/funnelService');

describe('View Funnel', () => {
  let mockedTransientFunnel: jest.Mock;
  let mockedTransientTrendsData: jest.Mock;

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

  const renderViewFunnel = async (
    router = createMockRouter({ query: { funnelId: '64349843748' } }),
    savedFunnel = props
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <ViewFunnel savedFunnel={savedFunnel} />
        </RouterContext.Provider>
      );
    });
  };

  const { ResizeObserver } = window;

  beforeEach(() => {
    mockedTransientFunnel = jest.mocked(APIService.getTransientFunnelData);
    mockedTransientTrendsData = jest.mocked(APIService.getTransientTrendsData);

    mockedTransientFunnel.mockReturnValue(funnelData);
    mockedTransientTrendsData.mockReturnValue(trendsData);

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

  it('renders funnel name, first step and last step name and (n-2) steps count', async () => {
    await renderViewFunnel();
    const funnelName = screen.getByTestId('funnel-name');
    const firstStepName = screen.getByTestId('first-step');
    const lastStepName = screen.getByTestId('last-step');
    const intermediateSteps = screen.getByTestId('intermediate-steps');

    expect(funnelName.textContent).toEqual('Test Funnel');
    expect(firstStepName.textContent).toEqual('Video_Click');
    expect(lastStepName.textContent).toEqual('Topic_Click');
    expect(intermediateSteps.textContent).toEqual(
      `+${props.steps.length - 2} Steps`
    );
  });

  it('should not render intermediate steps count text if steps count is 2', async () => {
    const savedFunnel = {
      ...props,
      steps: [
        { event: 'Video_Click', filters: [] },
        { event: 'Chapter_Click', filters: [] },
      ],
    };
    await renderViewFunnel(
      createMockRouter({ query: { funnelId: '64349843748' } }),
      savedFunnel
    );
    const intermediateSteps = screen.getByTestId('intermediate-steps');
    expect(intermediateSteps.textContent).toEqual('');
  });

  it('should redirect user to edit page on click of edit funnel button', async () => {
    const router = createMockRouter({
      query: { funnelId: '64349843748' },
      pathname: '/analytics/funnel/view',
    });
    await renderViewFunnel(router);

    const editFunnelButton = screen.getByTestId('edit-funnel');
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

    const editFunnelButton = screen.getByTestId('edit-funnel');
    fireEvent.click(editFunnelButton);
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
