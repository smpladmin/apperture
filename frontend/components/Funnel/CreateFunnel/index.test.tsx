import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import React from 'react';
import {
  getCountOfValidAddedSteps,
  isEveryStepValid,
  isEveryNonEmptyStepValid,
  transformFunnelData,
  isEveryFunnelStepFiltersValid,
} from '../util';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Funnel from './index';
import { createMockRouter } from 'tests/util';
import * as APIService from '@lib/services/funnelService';
import { getSearchResult } from '@lib/utils/common';
import {
  getEventProperties,
  getEventPropertiesValue,
} from '@lib/services/datasourceService';
import { MapContext } from '@lib/contexts/mapContext';
import { NodeType } from '@lib/types/graph';

jest.mock('../util');
jest.mock('@lib/services/funnelService');
jest.mock('@lib/utils/common');
jest.mock('@lib/services/datasourceService');

describe('create funnel', () => {
  let mockedGetCountOfValidAddedSteps: jest.Mock;
  let mockedIsEveryStepValid: jest.Mock;
  let mockedSearchResult: jest.Mock;
  let mockedIsEveryNonEmptyStepValid: jest.Mock;
  let mockedIsEveryFunnelStepFiltersValid: jest.Mock;
  let mockedTransformFunnelData: jest.Mock;
  let mockedGetTransientFunnelData: jest.Mock;
  let mockedSaveFunnel: jest.Mock;
  let mockUpdateFunnel: jest.Mock;
  let mockedGetEventProperties: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;

  const eventProperties = [
    'city',
    'device',
    'country',
    'app_version',
    'session_length',
  ];
  const eventPropertiesValues = [['android'], ['ios'], ['mac'], ['windows']];

  const renderCreateFunnel = async (
    router = createMockRouter({ query: { dsId: '654212033222' } }),
    props = {}
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <MapContext.Provider
            value={{
              state: {
                nodes: [
                  { id: 'Video_Click', label: 'Video_Click' },
                  { id: 'Chapter_Click', label: 'Video_Click' },
                  { id: 'Topic_Click', label: 'Video_Click' },
                ] as NodeType[],
                nodesData: [],
                activeNode: null,
                isNodeSearched: false,
              },
              dispatch: () => {},
            }}
          >
            <Funnel {...props} />
          </MapContext.Provider>
        </RouterContext.Provider>
      );
    });
  };

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
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedIsEveryFunnelStepFiltersValid = jest.mocked(
      isEveryFunnelStepFiltersValid
    );

    mockedGetCountOfValidAddedSteps.mockReturnValue(2);
    mockedIsEveryStepValid.mockReturnValue(true);
    mockedIsEveryFunnelStepFiltersValid.mockReturnValue(true);
    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetEventPropertiesValue.mockReturnValue(eventPropertiesValues);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => jest.clearAllMocks());

  describe('create funnel action', () => {
    it('save button is rendered and disabled when steps are not valid', async () => {
      mockedIsEveryStepValid.mockReturnValue(false);
      mockedIsEveryFunnelStepFiltersValid.mockReturnValue(false);
      await renderCreateFunnel();
      const saveButton = screen.getByTestId('save');

      expect(saveButton).toBeDisabled();
      expect(saveButton).toBeInTheDocument();
    });

    it('save button should get enabled when two valid steps are added', async () => {
      mockedIsEveryFunnelStepFiltersValid.mockReturnValue(true);
      await renderCreateFunnel();

      const saveButton = screen.getByTestId('save');
      expect(saveButton).toBeEnabled();
      expect(saveButton).toBeInTheDocument();
    });

    it('adds new funnel step on click of + button', async () => {
      await renderCreateFunnel();

      const addButton = screen.getByTestId('add-button');
      const funnelSteps = screen.getAllByTestId('funnel-step');

      await act(async () => {
        fireEvent.click(addButton);
      });

      const newAddedFunnelSteps = screen.getAllByTestId('funnel-step');
      expect(newAddedFunnelSteps.length).toEqual(funnelSteps.length + 1);
    });

    it('remove button should not be rendered on screen when there are only two funnel steps', async () => {
      await renderCreateFunnel();

      const funnelSteps = screen.getAllByTestId('funnel-step');
      fireEvent.mouseEnter(funnelSteps[0]);
      const removeButton = screen.queryByTestId('remove-funnel-step-0');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('removes input field on click of cross button', async () => {
      await renderCreateFunnel();

      const funnelSteps = screen.getAllByTestId('funnel-step');
      const addButton = screen.getByTestId('add-button');

      // add input field to render cross icon because
      // cross button would be rendered if there are more than two input
      await act(async () => {
        fireEvent.click(addButton);
      });
      fireEvent.mouseEnter(funnelSteps[1]);
      const removeButton = screen.getByTestId('remove-funnel-step-2');

      await act(async () => {
        fireEvent.click(removeButton);
      });

      const newAddedFunnelSteps = screen.getAllByTestId('funnel-step');
      expect(newAddedFunnelSteps.length).toEqual(funnelSteps.length);
    });
  });

  describe('save/update funnel', () => {
    const router = createMockRouter({
      query: { dsId: '654212033222' },
      pathname: '/analytics/funnel/create',
    });

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

      await renderCreateFunnel(router);
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
      mockedSaveFunnel.mockReturnValue({
        status: 500,
        data: {},
      });

      await renderCreateFunnel();

      const saveButton = screen.getByTestId('save');
      const eventName = screen.getAllByTestId('event-name');

      fireEvent.click(eventName[0]);
      const selectVideoClick = screen.getByText('Video_Click');

      await act(async () => {
        fireEvent.click(selectVideoClick);
      });

      fireEvent.click(eventName[1]);
      await act(async () => {
        fireEvent.click(selectVideoClick);
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

      await renderCreateFunnel(router);

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
      const searchResults = [{ id: 'Chapter_Click' }, { id: 'Chapter_Open' }];
      mockedSearchResult.mockReturnValue(searchResults);
      mockedIsEveryNonEmptyStepValid.mockReturnValue(true);
      await renderCreateFunnel();

      const eventName = screen.getAllByTestId('event-name');

      fireEvent.click(eventName[0]);
      const searchInput = screen.getByTestId('dropdown-search-input');

      fireEvent.change(searchInput, { target: { value: 'Chapter' } });
      const dropdownOptionsAfterSearch =
        screen.getAllByTestId('dropdown-options');

      dropdownOptionsAfterSearch.forEach((dropdownOption, i) => {
        expect(dropdownOption).toHaveTextContent(searchResults[i]['id']);
      });
      await act(async () => {
        fireEvent.click(dropdownOptionsAfterSearch[0]);
      });
      await waitFor(() =>
        expect(eventName[0].textContent).toEqual('Chapter_Click')
      );
    });
  });

  describe('view funnel empty state /funnelchart', () => {
    it('should render empty state initially when there are no or less than 2 valid events for creating funnel', async () => {
      mockedGetCountOfValidAddedSteps.mockReturnValue(0);
      await renderCreateFunnel();
      const emptyFunnelState = screen.getByTestId('funnel-empty-state');
      expect(emptyFunnelState).toBeInTheDocument();
    });

    it('should  paint the funnel chart/ trend chart when you select atleast two valid events', async () => {
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

      await renderCreateFunnel();

      const eventName = screen.getAllByTestId('event-name');

      fireEvent.click(eventName[0]);
      const selectVideoClick = screen.getByText('Video_Click');

      await act(async () => {
        fireEvent.click(selectVideoClick);
      });

      fireEvent.click(eventName[1]);
      const selectChapterClick = screen.getByText('Chapter_Click');

      await act(async () => {
        fireEvent.click(selectChapterClick);
      });

      await waitFor(() => {
        const chart = screen.getByTestId('funnel-chart');
        const trendChart = screen.getByTestId('funnel-trend');
        const funnelConversion = screen.getByTestId('funnel-conversion');

        expect(chart).toBeInTheDocument();
        expect(trendChart).toBeInTheDocument();
        expect(funnelConversion).toBeInTheDocument();
      });
    });
  });

  describe('edit funnel flow - when props are passed to component', () => {
    const props = {
      name: 'Test Funnel',
      steps: [
        { event: 'Video_Open', filters: [] },
        { event: 'Video_Seen', filters: [] },
        { event: 'Video_Download', filters: [] },
      ],
    };

    it('should render prefil funnel name with passed prop name and have input fields equal to steps length passed in props', async () => {
      const router = createMockRouter({
        query: { funnelid: '64349843748', dsId: '654212033222' },
        pathname: '/analytics/funnel/edit',
      });
      await renderCreateFunnel(router, props);
      const funnelName = screen.getByTestId('funnel-name');
      const funnelSteps = screen.getAllByTestId('funnel-step');

      expect(funnelName).toHaveDisplayValue('Test Funnel');
      expect(funnelSteps.length).toEqual(props.steps.length);
    });
  });
});
