import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import SelectProvider from './index';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';

jest.mock('@lib/services/integrationService');

describe('select integration provider', () => {
  let mockedCreateIntegrationWithDataSource: jest.Mock;

  beforeEach(() => {
    mockedCreateIntegrationWithDataSource = jest.mocked(
      createIntegrationWithDataSource
    );
    mockedCreateIntegrationWithDataSource.mockReturnValue({
      _id: '636a1c61d715ca6baae65611',
      appId: '636a1c61d715ca6baae65612',
      datasource: {
        _id: '636a1c61d715ca6baae65613',
        appId: '636a1c61d715ca6baae65612',
        enabled: true,
        externalSourceId: '123',
        integrationId: '636a1c61d715ca6baae65614',
        name: '',
        provider: Provider.APPERTURE,
        userId: '636a1c61d715ca6baae65615',
        version: 'DEFAULT',
      },
      provider: Provider.APPERTURE,
      userId: '636a1c61d715ca6baae65615',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render 6 integration provider(GA, Mixpanel, Amplitude,Clevertap, Apperture, Database)', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: '/analytics/app/[appId]/integration/select',
          query: { appId: '636a1c61d715ca6baae65612' },
        })}
      >
        <SelectProvider />
      </RouterContext.Provider>
    );

    const integrationProvider = screen.getAllByTestId('integration-provider');
    expect(integrationProvider.length).toBe(7);
  });

  it('user gets redirected to complete page when clicked on next button after selecting apperture integration provider', async () => {
    const router = createMockRouter({
      pathname: '/analytics/app/[appId]/integration/select',
      query: { appId: '636a1c61d715ca6baae65612' },
    });

    render(
      <RouterContext.Provider value={router}>
        <SelectProvider />
      </RouterContext.Provider>
    );

    const appertureIntegrationProvider = screen.getByText('Apperture');
    fireEvent.click(appertureIntegrationProvider);

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockedCreateIntegrationWithDataSource).toBeCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/analytics/app/[appId]/integration/[provider]/complete',
        query: {
          appId: '636a1c61d715ca6baae65612',
          dsId: '636a1c61d715ca6baae65613',
          provider: 'apperture',
        },
      });
    });
  });

  it('user gets redirected to provider create page when clicked on next button after selecting any integration provider other than apperture', async () => {
    const router = createMockRouter({
      pathname: '/analytics/app/[appId]/integration/select',
      query: { appId: '636a1c61d715ca6baae65612' },
    });

    render(
      <RouterContext.Provider value={router}>
        <SelectProvider />
      </RouterContext.Provider>
    );

    const mixpanelIntegrationProvider = screen.getByText('MixPanel');
    fireEvent.click(mixpanelIntegrationProvider);

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockedCreateIntegrationWithDataSource).toBeCalledTimes(0);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/analytics/app/[appId]/integration/[provider]/create',
        query: {
          appId: '636a1c61d715ca6baae65612',
          provider: 'mixpanel',
        },
      });
    });
  });
});
