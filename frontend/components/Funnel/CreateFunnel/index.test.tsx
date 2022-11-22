import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useRef } from 'react';
import {
  getCountOfValidAddedSteps,
  isEveryStepValid,
  isEveryNonEmptyStepValid,
  transformFunnelData,
} from '../util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Funnel from './index';
import { createMockRouter } from 'tests/util';
import * as APIService from '@lib/services/funnelService';
import { getSearchResult } from '@lib/utils/common';

jest.mock('../util');
jest.mock('@lib/services/funnelService');
jest.mock('@lib/utils/common');

describe('create funnel action component', () => {
  let mockedGetCountOfValidAddedSteps: jest.Mock;
  let mockedIsEveryStepValid: jest.Mock;
  let mockedSearchResult: jest.Mock;
  let mockedIsEveryNonEmptyStepValid: jest.Mock;
  let mockedTransformFunnelData: jest.Mock;
  let mockedGetTransientFunnelData: jest.Mock;
  let mockedSaveFunnel: jest.Mock;
  let mockUpdateFunnel: jest.Mock;

  beforeEach(() => {
    mockedGetCountOfValidAddedSteps = jest.mocked(getCountOfValidAddedSteps);
    mockedIsEveryStepValid = jest.mocked(isEveryStepValid);
    mockedSearchResult = jest.mocked(getSearchResult);
    mockedIsEveryNonEmptyStepValid = jest.mocked(isEveryNonEmptyStepValid);
    mockedTransformFunnelData = jest.mocked(transformFunnelData);
    mockedGetTransientFunnelData = jest.mocked(
      APIService.getTransientFunnelData
    );
    mockedSaveFunnel = jest.mocked(APIService.saveFunnel);
    mockUpdateFunnel = jest.mocked(APIService.updateFunnel);

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
      const saveButton = screen.getByTestId('save');

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

      const saveButton = screen.getByTestId('save');
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

  describe('save/update funnel', () => {
    const router = createMockRouter({
      query: { dsId: '654212033222' },
      pathname: '/analytics/funnel/create',
    });

    afterEach(() => jest.clearAllMocks());

    it('should be able to save funnel when atleast two valid events are added', async () => {
      mockedSearchResult.mockReturnValue([{ id: 'Chapter_Click' }]);
      mockedSaveFunnel.mockReturnValue({
        status: 200,
        data: {
          _id: '64349843748',
          datasourceId: '654212033222',
          steps: [
            { event: 'Video_Click', filters: [] },
            { event: 'Chapter_Click', filters: [] },
          ],
        },
      });

      render(
        <RouterContext.Provider value={router}>
          <Funnel />
        </RouterContext.Provider>
      );
      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/funnel/view/[funnelId]',
          query: { funnelId: '64349843748' },
        });
      });
    });

    it('should not be redirected to funnel page if save funnel case fails', async () => {
      mockedSearchResult.mockReturnValue([{ id: 'Chapter_Click' }]);
      mockedSaveFunnel.mockReturnValue({
        status: 500,
        data: {},
      });

      render(
        <RouterContext.Provider value={router}>
          <Funnel />
        </RouterContext.Provider>
      );

      const saveButton = screen.getByTestId('save');
      const inputFields = screen.getAllByTestId('autocomplete');
      fireEvent.change(inputFields[0], {
        target: { value: 'Video_Click' },
      });
      fireEvent.blur(inputFields[0]);

      fireEvent.focus(inputFields[1]);
      fireEvent.change(inputFields[1], {
        target: { value: 'Chapter_Click' },
      });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledTimes(0);
      });
    });

    it('should update the funnel when click on save button on edit page', async () => {
      mockedSearchResult.mockReturnValue([{ id: 'Chapter_Click' }]);
      mockUpdateFunnel.mockReturnValue({
        status: 200,
        datasourceId: '654212033222',
        steps: [
          { event: 'Video_Click', filters: [] },
          { event: 'Chapter_Click', filters: [] },
        ],
      });

      const router = createMockRouter({
        query: { dsId: '654212033222', funnelId: '64349843748' },
        pathname: '/analytics/funnel/edit',
      });

      render(
        <RouterContext.Provider value={router}>
          <Funnel />
        </RouterContext.Provider>
      );

      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateFunnel).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/funnel/view/[funnelId]',
          query: { funnelId: '64349843748' },
        });
      });
    });
  });

  describe('search ', () => {
    it('should show suggestion container when input field is focused and suggestions are present and should set the value when clicked on a suggestion', async () => {
      mockedSearchResult.mockReturnValue([
        { id: 'Chapter_Click' },
        { id: 'Chapter_Open' },
      ]);
      mockedIsEveryNonEmptyStepValid.mockReturnValue(true);

      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );

      const inputFields = screen.getAllByTestId('autocomplete');
      fireEvent.change(inputFields[0], { target: { value: 'Video_Click' } });
      fireEvent.blur(inputFields[0]);

      fireEvent.focus(inputFields[1]);
      fireEvent.change(inputFields[1], {
        target: { value: 'Cha' },
      });

      const suggestionContainer = screen.getByTestId('suggestion-container');
      expect(suggestionContainer).toBeVisible();

      const suggestions = screen.getAllByTestId('suggestion');
      fireEvent.click(suggestions[0]);
      await waitFor(() =>
        expect(inputFields[1]).toHaveDisplayValue('Chapter_Click')
      );
    });

    it('should be able to navigate with keys inside suggestion container and select suggestion', async () => {
      mockedSearchResult.mockReturnValue([
        { id: 'Chapter_Click' },
        { id: 'Chapter_Open' },
      ]);
      mockedIsEveryNonEmptyStepValid.mockReturnValue(true);
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );

      const inputFields = screen.getAllByTestId('autocomplete');
      fireEvent.change(inputFields[0], { target: { value: 'Video_Click' } });
      fireEvent.blur(inputFields[0]);

      fireEvent.focus(inputFields[1]);
      fireEvent.change(inputFields[1], {
        target: { value: 'Cha' },
      });
      const suggestionContainer = screen.getByTestId('suggestion-container');
      expect(suggestionContainer).toBeVisible();

      // move surson using Arrow Down key
      fireEvent.keyDown(inputFields[1], {
        key: 'ArrowDown',
      });

      // select suggestion by pressing Enter key
      fireEvent.keyDown(inputFields[1], {
        key: 'Enter',
      });
      await waitFor(() =>
        expect(inputFields[1]).toHaveDisplayValue('Chapter_Click')
      );
    });
  });

  describe('view funnel empty state /funnelchart', () => {
    it('should render empty state initially when there are no or less than 2 valid events for creating funnel', () => {
      mockedGetCountOfValidAddedSteps.mockReturnValue(0);
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );
      const emptyFunnelState = screen.getByTestId('funnel-empty-state');
      expect(emptyFunnelState).toBeInTheDocument();
    });

    it('should render loading state when there are 2 or more valid events and data is being fetched', () => {
      mockedGetCountOfValidAddedSteps.mockReturnValue(2);
      mockedGetTransientFunnelData.mockReturnValue([]);
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );
      const loader = screen.getByTestId('funnel-loader');
      expect(loader).toBeInTheDocument();
    });

    it('should  paint the funnel chart when you select atleast two valid events', async () => {
      mockedGetTransientFunnelData.mockReturnValue([
        { event: 'Video_Click', users: 2000, conversion: 100 },
        { event: 'Chapter_Click', users: 1000, conversion: 50 },
      ]);
      mockedSearchResult.mockReturnValue([{ id: 'Chapter_Click' }]);
      mockedIsEveryNonEmptyStepValid.mockReturnValue(true);
      mockedTransformFunnelData.mockReturnValue([
        { event: ' Video_Click', users: 2000, conversion: 100 },
        { event: '  Chapter_Click', users: 1000, conversion: 50 },
      ]);

      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <Funnel />
        </RouterContext.Provider>
      );

      const inputFields = screen.getAllByTestId('autocomplete');
      const loader = screen.getByTestId('funnel-loader');

      fireEvent.change(inputFields[0], { target: { value: 'Video_Click' } });
      fireEvent.blur(inputFields[0]);

      fireEvent.focus(inputFields[1]);
      fireEvent.change(inputFields[1], {
        target: { value: 'Chapter_Click' },
      });

      const suggestionContainer = screen.getByTestId('suggestion-container');
      const suggestion = screen.getByTestId('suggestion');
      expect(suggestionContainer).toBeVisible();
      fireEvent.click(suggestion);

      await waitFor(() => {});
    });
  });
});
