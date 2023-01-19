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

jest.mock('@lib/services/funnelService');

describe('View Funnel', () => {
  let mockedComputedFunnel: jest.Mock;
  let mockedComputedTrendsData: jest.Mock;

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
    ],
    randomSequence: false,
  };

  const renderViewFunnel = async (
    router = createMockRouter({ query: { funnelId: '64349843748' } })
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <ViewFunnel />
        </RouterContext.Provider>
      );
    });
  };

  beforeEach(() => {
    mockedComputedFunnel = jest.mocked(APIService.getComputedFunnelData);
    mockedComputedTrendsData = jest.mocked(APIService.getComputedTrendsData);

    mockedComputedFunnel.mockReturnValue(computedFunnel);
    mockedComputedTrendsData.mockReturnValue([
      {
        conversion: 23.1,
        startDate: new Date('2022-10-11'),
        endDate: new Date('2022-10-17'),
        firstStepUsers: 49,
        lastStepUsers: 8,
      },
    ]);
  });

  afterEach(() => {
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
      `+${computedFunnel.steps.length - 2} Steps`
    );
  });

  it('should not render intermediate steps count text if steps count is 2', async () => {
    mockedComputedFunnel.mockReturnValue({
      ...computedFunnel,
      steps: [
        { event: 'Video_Click', filters: [] },
        { event: 'Chapter_Click', filters: [] },
      ],
    });

    await renderViewFunnel();
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
});
