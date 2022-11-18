jest.mock('@antv/g2', () => ({
  Chart: jest.fn(),
}));
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { getCountOfValidAddedSteps, isEveryStepValid } from '../util';

jest.mock('../util');

Object.defineProperty(global.URL, 'createObjectURL', {
  value: () => {},
  writable: true,
});

import CreateFunnelAction from './CreateFunnelAction';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Funnel from './index';

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
  }),
}));

describe('create funnel action component', () => {
  const props = {
    funnelName: 'Test',
    setFunnelName: jest.fn(),
    funnelSteps: [
      { event: 'Video_Open', filters: [] },
      { event: 'Video_Seen', filters: [] },
    ],
    setFunnelSteps: jest.fn(),
    setFunnelData: jest.fn(),
  };

  let mockedGetCountOfValidAddedSteps: jest.Mock;
  let mockedIsEveryStepValid: jest.Mock;

  beforeEach(() => {
    mockedGetCountOfValidAddedSteps = jest.mocked(getCountOfValidAddedSteps);
    mockedIsEveryStepValid = jest.mocked(isEveryStepValid);
    mockedGetCountOfValidAddedSteps.mockReturnValue(2);
    mockedIsEveryStepValid.mockReturnValue(true);
  });

  it('save button is rendered and disabled', () => {
    mockedIsEveryStepValid.mockReturnValue(false);
    render(<CreateFunnelAction {...props} />);
    const saveButton = screen.getByText('Save').closest('button');

    expect(saveButton).toBeDisabled();
    expect(saveButton).toBeInTheDocument();
  });

  it('save button should get enabled when two valid steps are added', () => {
    render(<CreateFunnelAction {...props} />);

    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).toBeEnabled();
    expect(saveButton).toBeInTheDocument();
  });

  it.only('adds new input field on click of + button', async () => {
    render(<Funnel />);

    const addButton = screen.getByTestId('add-button');
    fireEvent.click(addButton);

    await waitFor(() => {
      const inputFields = screen.getAllByTestId('autocomplete');
      screen.debug(inputFields);
    });
  });
});

// {
//   /* <RouterContext.Provider
//   value={createMockRouter({ query: { dsId: '654212033222' } })}
// >
//   <CreateFunnelAction {...defaultProps} />
// </RouterContext.Provider>; */
// }
