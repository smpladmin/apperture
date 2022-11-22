import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { getCountOfValidAddedSteps, isEveryStepValid } from '../util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Funnel from './index';
import { createMockRouter } from 'tests/util';

jest.mock('@antv/g2', () => ({
  Chart: jest.fn(),
}));
jest.mock('../util');
Object.defineProperty(global.URL, 'createObjectURL', {
  value: () => {},
  writable: true,
});

describe('create funnel action component', () => {
  let mockedGetCountOfValidAddedSteps: jest.Mock;
  let mockedIsEveryStepValid: jest.Mock;

  beforeEach(() => {
    mockedGetCountOfValidAddedSteps = jest.mocked(getCountOfValidAddedSteps);
    mockedIsEveryStepValid = jest.mocked(isEveryStepValid);
    mockedGetCountOfValidAddedSteps.mockReturnValue(2);
    mockedIsEveryStepValid.mockReturnValue(true);
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('create funnel action', () => {
    it('save button is rendered and disabled when steps are not valid', () => {
      mockedIsEveryStepValid.mockReturnValue(false);
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );
      const saveButton = screen.getByText('Save').closest('button');

      expect(saveButton).toBeDisabled();
      expect(saveButton).toBeInTheDocument();
    });

    it('save button should get enabled when two valid steps are added', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );

      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).toBeEnabled();
      expect(saveButton).toBeInTheDocument();
    });

    it('adds new input field on click of + button', async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );

      const addButton = screen.getByTestId('add-button');
      const inputFields = screen.getAllByTestId('autocomplete');
      fireEvent.click(addButton);

      const newAddedInputFields = screen.getAllByTestId('autocomplete');
      expect(newAddedInputFields.length).toEqual(inputFields.length + 1);
    });

    it('remove button should not be rendered on screen when there are only two input fields', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );

      const removeButton = screen.queryByAltText('cross-icon');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('removes input field on click of cross button', async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );

      const inputFields = screen.getAllByTestId('autocomplete');
      const addButton = screen.getByTestId('add-button');

      // add input field to render cross icon because
      // cross button would be rendered if there are more than two input
      fireEvent.click(addButton);

      const removeButton = screen.getByTestId('remove-button 2');
      fireEvent.click(removeButton);

      const newAddedInputFields = screen.getAllByTestId('autocomplete');
      expect(newAddedInputFields.length).toEqual(inputFields.length);
    });
  });

  describe('right view of create funnel action', () => {
    it('should render empty state initially when there are no or less than 2 valid events for creating funnel', () => {
      mockedGetCountOfValidAddedSteps.mockReturnValue(0);
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );
      const emptyFunnelImage = screen.getByTestId('funnel-empty-state');
      const emptyFunnelStateText = screen.getByText(
        'Enter events to create a funnel'
      );
      expect(emptyFunnelImage).toBeVisible();
      expect(emptyFunnelStateText).toBeVisible();
    });

    it('should render loading state when there are 2 or more valid events and data is being fetched', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );
    });
  });
});
