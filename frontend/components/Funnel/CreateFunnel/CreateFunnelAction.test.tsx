import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import CreateFunnelAction from './CreateFunnelAction';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { getCountOfValidAddedSteps, isEveryStepValid } from '../util';

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

  // beforeEach(() => {
  //   jest.fn(getCountOfValidAddedSteps).mockReturnValue(2);
  //   jest.fn(isEveryStepValid).mockReturnValue(true);
  // });

  it('save button is rendered and disabled', () => {
    render(<CreateFunnelAction {...props} />);
    const saveButton = screen.getByText('Save').closest('button');

    expect(saveButton).toBeDisabled();
    expect(saveButton).toBeInTheDocument();
  });

  it('save button should get enabled when two valid steps are added', () => {
    render(<CreateFunnelAction {...props} />);
    jest.fn(getCountOfValidAddedSteps).mockReturnValue(2);
    jest.fn(isEveryStepValid).mockReturnValue(true);
    const saveButton = screen.getByText('Save').closest('button');

    expect(saveButton).toBeEnabled();
    expect(saveButton).toBeInTheDocument();
  });

  it('adds new input field on click of + button', async () => {
    render(<CreateFunnelAction {...props} />);
    const addButton = screen.getByRole('button', {
      name: '+',
    });

    fireEvent.click(addButton);
    expect(props.setFunnelSteps).toBeCalledTimes(1);
    // expect(props.funnelSteps).toHaveLength(3);
  });
});

{
  /* <RouterContext.Provider
  value={createMockRouter({ query: { dsId: '654212033222' } })}
>
  <CreateFunnelAction {...defaultProps} />
</RouterContext.Provider>; */
}
