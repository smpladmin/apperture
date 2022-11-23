import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import ViewFunnel from './index';

describe('View Funnel', () => {
  const props = {
    datasourceId: '654212033222',
    name: 'Test Funnel',
    steps: [
      { event: 'Video_Click', filters: [] },
      { event: 'Chapter_Click', filters: [] },
      { event: 'Topic_Click', filters: [] },
    ],
    computedFunnel: [
      { event: 'Video_Click', users: 2000, conversion: 100 },
      { event: 'Chapter_Click', users: 1000, conversion: 50 },
      { event: 'Topic_Click', users: 750, conversion: 75 },
    ],
    randomSequence: false,
  };

  it('renders funnel name, first step and last step name and (n-2) steps count', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ query: { funnelId: '64349843748' } })}
      >
        <ViewFunnel computedFunnelData={{ ...props }} />
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
        <ViewFunnel computedFunnelData={{ ...props }} />
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
        <ViewFunnel computedFunnelData={{ ...props }} />
      </RouterContext.Provider>
    );

    const editFunnelButton = screen.getByTestId('edit-funnel');
    fireEvent.click(editFunnelButton);
    const chart = screen.getByTestId('funnel-chart');
    expect(chart).toBeInTheDocument();
  });
});
