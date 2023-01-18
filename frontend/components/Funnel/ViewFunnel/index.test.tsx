import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import ViewFunnel from './index';

describe('View Funnel', () => {
  const props = {
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
    computedTrendsData: [
      {
        conversion: 23.1,
        startDate: new Date('2022-10-11'),
        endDate: new Date('2022-10-17'),
        firstStepUsers: 49,
        lastStepUsers: 8,
      },
    ],
  };

  it('renders funnel name, first step and last step name and (n-2) steps count', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ query: { funnelId: '64349843748' } })}
      >
        <ViewFunnel
          computedFunnelData={{ ...props }}
          computedTrendsData={props.computedTrendsData}
        />
      </RouterContext.Provider>
    );

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

  it('should not render intermediate steps count text if steps count is 2', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ query: { funnelId: '64349843748' } })}
      >
        <ViewFunnel
          computedFunnelData={{
            ...{
              ...props,
              steps: [
                { event: 'Video_Click', filters: [] },
                { event: 'Chapter_Click', filters: [] },
              ],
            },
          }}
          computedTrendsData={props.computedTrendsData}
        />
      </RouterContext.Provider>
    );

    const intermediateSteps = screen.getByTestId('intermediate-steps');
    expect(intermediateSteps.textContent).toEqual('');
  });

  it('should redirect user to edit page on click of edit funnel button', async () => {
    const router = createMockRouter({
      query: { funnelId: '64349843748' },
      pathname: '/analytics/funnel/view',
    });
    render(
      <RouterContext.Provider value={router}>
        <ViewFunnel
          computedFunnelData={{ ...props }}
          computedTrendsData={props.computedTrendsData}
        />
      </RouterContext.Provider>
    );

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
    render(
      <RouterContext.Provider value={router}>
        <ViewFunnel
          computedFunnelData={{ ...props }}
          computedTrendsData={props.computedTrendsData}
        />
      </RouterContext.Provider>
    );

    const editFunnelButton = screen.getByTestId('edit-funnel');
    fireEvent.click(editFunnelButton);
    const chart = screen.getByTestId('funnel-chart');
    const trendsChart = screen.getByTestId('funnel-trend');
    expect(chart).toBeInTheDocument();
    expect(trendsChart).toBeInTheDocument();
  });
});
