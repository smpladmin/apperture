import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import APIKey from './index';
import { createMockRouter } from 'tests/util';
import { AppertureUser } from '@lib/domain/user';
import { generateAPIKey } from '@lib/services/apiKeyService';

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: async () => {},
  },
});

jest.mock('@lib/services/apiKeyService', () => ({
  generateAPIKey: jest.fn(() => ({ status: 200, data: 'mock-api-key' })),
}));
jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

describe('APIKey component', () => {
  const user = {
    id: '434734k434',
    firstName: 'Anish',
    lastName: 'Kaushal',
    email: 'anish@parallelhq.com',
    picture:
      'https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c',
    slackChannel: null,
    apiKey: '',
  };

  const renderAPIKey = (appertureUser: AppertureUser = user) => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: '/analytics/app/[appId]/integration/select',
          query: { appId: '636a1c61d715ca6baae65612' },
        })}
      >
        <APIKey user={appertureUser} />
      </RouterContext.Provider>
    );
  };

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('renders the "Generate API Key" button initially', () => {
    renderAPIKey();

    const generateButton = screen.getByText('Generate API Key');
    expect(generateButton).toBeInTheDocument();
  });

  it('renders the API key when it exists', () => {
    const appertureUser = { ...user, apiKey: 'mock-existing-api-key' };
    renderAPIKey(appertureUser);

    const apiKeyText = screen.getByText('Your API Key');
    expect(apiKeyText).toBeInTheDocument();
    const apiKeyValue = screen.getByText('mock-existing-api-key');
    expect(apiKeyValue).toBeInTheDocument();
  });

  it('clicking "Generate API Key" button calls handleGenerateAPIKey', async () => {
    renderAPIKey();

    const generateButton = screen.getByText('Generate API Key');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateAPIKey).toHaveBeenCalledTimes(1);
    });
  });

  it('clicking "Copy" button calls handleCopyClick', async () => {
    const appertureUser = { ...user, apiKey: 'mock-api-key' };
    renderAPIKey(appertureUser);

    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'mock-api-key'
      );
    });
  });
});
