import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import CreateSegment from './index';
import { createMockRouter } from 'tests/util';
import {
  getEventProperties,
  getEventPropertiesValue,
} from '@lib/services/datasourceService';
import { getSearchResult } from '@lib/utils/common';
import { computeSegment } from '@lib/services/segmentService';
import { SegmentFilterConditions } from '@lib/domain/segment';

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/utils/common');
jest.mock('@lib/services/segmentService');

describe('Create Segment', () => {
  let mockedGetEventProperties: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;
  let mockedSearchResult: jest.Mock;
  let mockedTransientSegment: jest.Mock;

  const eventProperties = [
    'city',
    'device',
    'country',
    'app_version',
    'session_length',
  ];
  const transientSegmentResponse = {
    count: 3,
    data: [
      {
        user_id: 'sabiha6514@gmail.com',
        'properties.$city': 'Chennai',
        'properties.$app_version': '1.5.5',
      },
      {
        user_id: 'bordoloidebojit69@gmail.com',
        'properties.$city': 'Guwahati',
        'properties.$app_version': '1.5.5',
      },
      {
        user_id: '4f36e6e5-3534-4e54-976a-fdcc6369a6e6',
        'properties.$city': 'Patna',
        'properties.$app_version': '1.5.6',
      },
    ],
  };

  beforeEach(() => {
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedSearchResult = jest.mocked(getSearchResult);
    mockedTransientSegment = jest.mocked(computeSegment);

    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetEventPropertiesValue.mockReturnValue([
      ['android'],
      ['ios'],
      ['mac'],
      ['windows'],
    ]);
    mockedTransientSegment.mockReturnValue(transientSegmentResponse);
  });

  it('renders create segment folder', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '654212033222' } })}
        >
          <CreateSegment />
        </RouterContext.Provider>
      );
    });

    const segmentBuilderText = screen.getByTestId('segment-builder');
    expect(segmentBuilderText).toBeInTheDocument();
  });

  describe('add filter', () => {
    it('create new query once we select property from eventsDropdown ', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );

      expect(dropDownContainer).toBeVisible();
      const dropdownOptions = screen.getAllByTestId('dropdown-options');

      // click on the second option from dropdown option
      await act(async () => {
        fireEvent.click(dropdownOptions[1]);
      });

      await waitFor(() => {
        const eventPropertyText = screen.getByTestId('event-property');
        // eventProperty should be equal to value selected from drodown (i.e. 'device' in this case)and dropdown should get closed
        expect(eventPropertyText).toHaveTextContent('device');
        expect(dropDownContainer).not.toBeVisible();
      });
    });
  });

  describe('select event property from property drodpown', () => {
    it(`should be able to change property by clicking on the event property text and selecting from dropdown after adding it from filter`, async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );
      expect(dropDownContainer).toBeVisible();
      const dropdownOptions = screen.getAllByTestId('dropdown-options');

      await act(async () => {
        fireEvent.click(dropdownOptions[1]);
      });
      const eventPropertyText = screen.getByTestId('event-property');
      fireEvent.click(eventPropertyText);

      // select elements again with same data-testid as previous selected elements are not in DOM anymore
      const propertyDropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );
      const propertyDropdownOptions = screen.getAllByTestId('dropdown-options');

      // dropdown to be visible again
      expect(propertyDropDownContainer).toBeVisible();
      await waitFor(() => {
        fireEvent.click(propertyDropdownOptions[0]);
        // the text should be updated to 'city' from 'device' after changong from dropdown
        expect(eventPropertyText).toHaveTextContent('city');
        expect(propertyDropDownContainer).not.toBeVisible();
      });
    });
  });

  describe('select property value from dropdown', () => {
    it('select value from values dropdown and it should get displayed on the screen ', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );

      expect(dropDownContainer).toBeVisible();
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[1]);
      });
      const propertyValuesText = screen.getByTestId('event-property-value');
      const propertyValuesDropdown = screen.getByTestId(
        'property-values-dropdown-container'
      );
      const addPropertyValuesButton = screen.getByTestId(
        'add-event-property-values'
      );
      await waitFor(() => {
        expect(propertyValuesText).toHaveTextContent('Select value...');
        expect(propertyValuesDropdown).toBeVisible();
        const propertyValues = screen.getAllByTestId(
          'property-value-dropdown-option'
        );

        fireEvent.click(propertyValues[0]);
        fireEvent.click(propertyValues[1]);
      });

      await act(async () => {
        fireEvent.click(addPropertyValuesButton);
      });

      await waitFor(() => {
        // properties values text should be the options which are selected and dropdown should be closed
        expect(propertyValuesText).toHaveTextContent('android, ios');
        expect(propertyValuesDropdown).not.toBeVisible();
      });
    });

    it(`select all value from values dropdown when 'Select all' checkbox is selected and values should get displayed on the screen in acertain format`, async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );

      expect(dropDownContainer).toBeVisible();
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[1]);
      });
      const propertyValuesText = screen.getByTestId('event-property-value');
      const propertyValuesDropdown = screen.getByTestId(
        'property-values-dropdown-container'
      );
      const addPropertyValuesButton = screen.getByTestId(
        'add-event-property-values'
      );
      await waitFor(() => {
        expect(propertyValuesText).toHaveTextContent('Select value...');
        expect(propertyValuesDropdown).toBeVisible();
        const selectAllCheckbox = screen.getByTestId('select-all-values');

        fireEvent.click(selectAllCheckbox);
      });

      await act(async () => {
        fireEvent.click(addPropertyValuesButton);
      });

      await waitFor(() => {
        // properties values text should be the options which are selected and dropdown should be closed
        expect(propertyValuesText).toHaveTextContent('android, ios or 2 more');
        expect(propertyValuesDropdown).not.toBeVisible();
      });
    });
  });

  describe('search', () => {
    it('should be able to search event properties', async () => {
      const searchResults = ['city', 'nomination_city', 'proximity'];
      mockedSearchResult.mockReturnValue(searchResults);

      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );

      expect(dropDownContainer).toBeVisible();
      const searchInput = screen.getByTestId('dropdown-search-input');

      fireEvent.change(searchInput, { target: { value: 'cit' } });
      const dropdownOptionsAfterSearch =
        screen.getAllByTestId('dropdown-options');

      dropdownOptionsAfterSearch.forEach((dropdownOption, i) => {
        expect(dropdownOption).toHaveTextContent(searchResults[i]);
      });

      await act(async () => {
        fireEvent.click(dropdownOptionsAfterSearch[0]);
      });

      await waitFor(() => {
        const eventPropertyText = screen.getByTestId('event-property');
        // eventProperty should be equal to value selected from drodown (i.e. 'city' in this case)and dropdown should get closed
        expect(eventPropertyText).toHaveTextContent('city');
        expect(dropDownContainer).not.toBeVisible();
      });
    });

    it('should be able to search values for event properties', async () => {
      const searchResults = [
        'Mumbai',
        'Navi Mumbai',
        'Muzzafurpur',
        'Muridkle',
      ];
      mockedSearchResult.mockReturnValue(searchResults);

      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[0]);
      });
      const propertyValuesText = screen.getByTestId('event-property-value');
      const addPropertyValuesButton = screen.getByTestId(
        'add-event-property-values'
      );

      const searchInput = screen.getByTestId('dropdown-search-input');
      fireEvent.change(searchInput, { target: { value: 'Mu' } });

      const propertyValuesAfterSearch = screen.getAllByTestId(
        'property-value-dropdown-option'
      );
      propertyValuesAfterSearch.forEach((value, i) => {
        expect(value).toHaveTextContent(searchResults[i]);
      });

      await act(async () => {
        fireEvent.click(propertyValuesAfterSearch[0]);
        fireEvent.click(propertyValuesAfterSearch[1]);
        fireEvent.click(addPropertyValuesButton);
      });

      await waitFor(() => {
        expect(propertyValuesText).toHaveTextContent('Mumbai, Navi Mumbai');
      });
    });

    it('should reset to show all the data options after search once dropdown is open again', async () => {
      const searchResults = ['city', 'nomination_city', 'proximity'];
      mockedSearchResult.mockReturnValue(searchResults);

      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropDownContainer = screen.getByTestId(
        'event-property-dropdown-container'
      );

      expect(dropDownContainer).toBeVisible();
      const searchInput = screen.getByTestId('dropdown-search-input');

      fireEvent.change(searchInput, { target: { value: 'cit' } });
      const dropdownOptionsAfterSearch =
        screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptionsAfterSearch[0]);
      });

      // again open dropdown by clicking on add filter button
      fireEvent.click(addFilterButton);
      const dropdownOptions = screen.getAllByTestId('dropdown-options');

      // dropdown options should be the event properties(not the search result)
      dropdownOptions.forEach((option, index) => {
        expect(option).toHaveTextContent(eventProperties[index]);
      });
    });
  });
});

describe('Show savedSegment in Edit mode', () => {
  it.only('Test segmentService', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: {
              segmentId: '639821f7f5903afb0a1b5fa6',
              dsId: '638f1aac8e54760eafc64d70',
            },
          })}
        >
          <CreateSegment
            savedSegment={{
              app_id: '638f1a928e54760eafc64d6e',
              columns: [
                'user_id',
                'properties.$city',
                'properties.$app_version',
              ],
              createdAt: new Date('2022-12-19T09:04:44.566000'),
              datasourceId: '638f1aac8e54760eafc64d70',
              description: 'Dummy segment to test Edit segment component',
              groupConditions: [],
              groups: [
                {
                  filters: [
                    {
                      operand: 'properties.$city',
                      operator: 'equals',
                      values: ['Chennai', 'Guwahati', 'Patna'],
                    },
                    {
                      operand: 'properties.$app_version',
                      operator: 'equals',
                      values: ['1.5.5', '1.5.6'],
                    },
                  ],
                  conditions: [
                    SegmentFilterConditions.WHERE,
                    SegmentFilterConditions.AND,
                  ],
                },
              ],
              name: 'Testing edit Segments ',
              updatedAt: new Date('2022-12-19T09:04:44.567000'),
              userId: '638f1a128e54760eafc64d6c',
              _id: '63a0292cd9ae5bf509df9ac7',
            }}
          />
        </RouterContext.Provider>
      );
    });
    const queries = screen.getAllByTestId('query-builder');
    console.debug({ queries });
  });
});
