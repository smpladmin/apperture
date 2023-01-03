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
  getNodes,
} from '@lib/services/datasourceService';
import { getSearchResult, capitalizeFirstLetter } from '@lib/utils/common';
import {
  computeSegment,
  saveSegment,
  updateSegment,
} from '@lib/services/segmentService';
import {
  FilterType,
  SegmentFilter,
  SegmentFilterConditions,
  SegmentGroupConditions,
  WhereSegmentFilter,
} from '@lib/domain/segment';
import { getUserInfo } from '@lib/services/userService';

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/utils/common');
jest.mock('@lib/services/segmentService');
jest.mock('@lib/services/userService');

describe('Create Segment', () => {
  const getWhereElementsText = (queries: HTMLElement[], index: number) =>
    Array.from(queries[index].getElementsByTagName('p')).map(
      (el) => el.textContent
    );

  const addWhereFilter = async () => {
    const addFilterButton = screen.getByTestId('add-filter');

    fireEvent.click(addFilterButton);
    const dropdownOptions = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(dropdownOptions[1]);
    });
    await waitFor(async () => {
      const propertyValues = screen.getAllByTestId(
        'property-value-dropdown-option'
      );
      const addPropertyValuesButton = screen.getByTestId(
        'add-event-property-values'
      );
      fireEvent.click(propertyValues[0]);
      fireEvent.click(propertyValues[1]);
      fireEvent.click(addPropertyValuesButton);
    });
  };

  const addWhoFilter = async (elementIndex: number = 5) => {
    const addFilterButton = screen.getByTestId('add-filter');

    fireEvent.click(addFilterButton);
    const dropdownOptions = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      // 6th element in list is the event, which would result in who filter
      fireEvent.click(dropdownOptions[elementIndex]);
    });
  };

  const assertFilterConditions = (expectedFilterConditions: string[]) => {
    const filterConditions = screen.getAllByTestId('filter-condition');
    filterConditions.forEach((condition, i) => {
      expect(condition).toHaveTextContent(expectedFilterConditions[i]);
    });
    expect(filterConditions.length).toEqual(expectedFilterConditions.length);
  };

  const switchFilterCondition = async (index: number) => {
    await act(async () => {
      const filterConditionOptions = screen.getAllByTestId(
        'filter-conditions-options'
      );
      // index 0 - corresponds to 'and'
      // index 1 - corresponds to 'or'
      fireEvent.click(filterConditionOptions[index]);
    });
  };

  const removeFilter = async (filterIndex: number) => {
    const removeFilterButton = screen.getAllByTestId('remove-filter');
    await act(async () => {
      fireEvent.click(removeFilterButton[filterIndex]);
    });
  };

  const getGroupConditionText = () => {
    const groupConditions = screen.getAllByTestId('group-condition');
    return groupConditions.map((condition) => condition.textContent);
  };

  let mockedGetEventProperties: jest.Mock;
  let mockedGetNodes: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;
  let mockedSearchResult: jest.Mock;
  let mockedTransientSegment: jest.Mock;
  let mockedGetUserInfo: jest.Mock;
  let mockedSaveSegment: jest.Mock;
  let mockedCapitalizeLetter: jest.Mock;
  let mockedUpdateSegment: jest.Mock;

  const eventProperties = [
    'city',
    'device',
    'country',
    'app_version',
    'session_length',
  ];

  const events = [
    { id: 'App_Open' },
    { id: 'Login' },
    { id: 'Video_Open' },
    { id: 'Video_Seen' },
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

  const savedSegmentprops = {
    appId: '638f1a928e54760eafc64d6e',
    columns: ['user_id', 'properties.$city', 'properties.$app_version'],
    createdAt: new Date('2022-12-19T09:04:44.566000'),
    datasourceId: '638f1aac8e54760eafc64d70',
    description: 'Dummy segment to test Edit segment component',
    groupConditions: [],
    groups: [
      {
        filters: [
          {
            condition: SegmentFilterConditions.WHERE,
            operand: 'properties.$city',
            operator: 'equals',
            values: ['Chennai', 'Guwahati', 'Patna'],
            type: FilterType.WHERE,
          },
          {
            condition: SegmentFilterConditions.AND,
            operand: 'properties.$app_version',
            operator: 'equals',
            values: ['1.5.5', '1.5.6'],
            type: FilterType.WHERE,
          },
        ] as WhereSegmentFilter[],
        condition: SegmentGroupConditions.AND,
      },
    ],
    name: 'Testing edit Segments ',
    updatedAt: new Date('2022-12-19T09:04:44.567000'),
    userId: '638f1a128e54760eafc64d6c',
    _id: '63a0292cd9ae5bf509df9ac7',
  };
  beforeEach(() => {
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetNodes = jest.mocked(getNodes);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedSearchResult = jest.mocked(getSearchResult);
    mockedTransientSegment = jest.mocked(computeSegment);
    mockedGetUserInfo = jest.mocked(getUserInfo);
    mockedSaveSegment = jest.mocked(saveSegment);
    mockedCapitalizeLetter = jest.mocked(capitalizeFirstLetter);
    mockedUpdateSegment = jest.mocked(updateSegment);

    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetNodes.mockReturnValue(events);
    mockedGetEventPropertiesValue.mockReturnValue([
      ['android'],
      ['ios'],
      ['mac'],
      ['windows'],
    ]);
    mockedTransientSegment.mockReturnValue(transientSegmentResponse);
    mockedGetUserInfo.mockReturnValue({
      email: 'apperture@parallelhq.com',
      firstName: 'Apperture',
      lastName: 'Analytics',
      picture: 'https://lh2.googleusercontent.com',
      slackChannel: null,
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('renders create segment component', () => {
    it('render segment', async () => {
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

    it('add multiple filters with mix of eventProperties and event ', async () => {
      mockedCapitalizeLetter.mockReturnValue('total');
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      await addWhereFilter();
      await addWhoFilter(5);
      await addWhereFilter();
      await addWhereFilter();
      await addWhoFilter(6);

      const queries = screen.getAllByTestId('query-builder');

      const firstQueryTextElements = getWhereElementsText(queries, 0);
      const secondQueryTextElements = getWhereElementsText(queries, 1);
      const thirdQueryTextElements = getWhereElementsText(queries, 2);
      const fourthQueryTextElements = getWhereElementsText(queries, 3);
      const fifthQueryTextElements = getWhereElementsText(queries, 4);

      //first three filters should be where filter independent of the fact when where filter is added
      expect(firstQueryTextElements).toEqual([
        'where',
        'device',
        'equals',
        'android, ios',
      ]);
      expect(secondQueryTextElements).toEqual([
        'and',
        'device',
        'equals',
        'android, ios',
      ]);
      expect(thirdQueryTextElements).toEqual([
        'and',
        'device',
        'equals',
        'android, ios',
      ]);
      expect(fourthQueryTextElements).toEqual([
        'who',
        'Triggered',
        'App_Open',
        'total',
        'equals',
        'Last 30 days',
      ]);
      expect(fifthQueryTextElements).toEqual([
        'and',
        'Triggered',
        'Login',
        'total',
        'equals',
        'Last 30 days',
      ]);
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
      const searchResults = [
        { id: 'city' },
        { id: 'nomination_city' },
        { id: 'proximity' },
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

      expect(dropDownContainer).toBeVisible();
      const searchInput = screen.getByTestId('dropdown-search-input');

      fireEvent.change(searchInput, { target: { value: 'cit' } });
      const dropdownOptionsAfterSearch =
        screen.getAllByTestId('dropdown-options');

      dropdownOptionsAfterSearch.forEach((dropdownOption, i) => {
        expect(dropdownOption).toHaveTextContent(searchResults[i]['id']);
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
      const searchResults = [
        { id: 'city' },
        { id: 'nomination_city' },
        { id: 'proximity' },
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

      expect(dropDownContainer).toBeVisible();
      const searchInput = screen.getByTestId('dropdown-search-input');

      fireEvent.change(searchInput, { target: { value: 'cit' } });
      const dropdownOptionsAfterSearch =
        screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptionsAfterSearch[0]);
      });

      // again open dropdown by clicking on add filter button
      await act(async () => {
        fireEvent.click(addFilterButton);
      });

      const dropdownOptions = screen.getAllByTestId('dropdown-options');

      // dropdown options should be the event properties(not the search result)
      const expectedDropdownOption = [
        'city',
        'device',
        'country',
        'app_version',
        'session_length',
        'App_Open',
        'Login',
        'Video_Open',
        'Video_Seen',
      ];
      dropdownOptions.forEach((option, index) => {
        expect(option).toHaveTextContent(expectedDropdownOption[index]);
      });
    });
  });

  describe('edit columns', () => {
    it('should add columns to table which are selected from edit column dropdown', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });
      const usersCountText = screen.getByTestId('users-count');
      const segmentTable = screen.getByTestId('segment-table');
      const segmentTableHeaders = screen.getByTestId('segment-table-headers');
      const editColumnButton = screen.getByTestId('edit-column');

      expect(usersCountText).toHaveTextContent('3 Users');
      expect(segmentTable).toBeInTheDocument();
      // initially there would be only one column header i.e. user_id
      expect(segmentTableHeaders).toHaveTextContent('user_id');

      fireEvent.click(editColumnButton);
      const columnOptions = screen.getAllByTestId(
        'property-value-dropdown-option'
      );
      const addColumnButton = screen.getByTestId('add-event-property-values');

      await act(async () => {
        // select two event properties from dropdown, (here those two properties are 'city' and 'device')
        fireEvent.click(columnOptions[0]);
        fireEvent.click(columnOptions[1]);
        fireEvent.click(addColumnButton);
      });

      await waitFor(() => {
        const newSegmentTableHeaders = screen.getAllByTestId(
          'segment-table-headers'
        );
        // expected columns should be user_id and the two selected columns
        const expectedColumnn = ['user_id', 'city', 'device'];

        newSegmentTableHeaders.forEach((header, index) => {
          expect(header).toHaveTextContent(expectedColumnn[index]);
        });
      });
    });
  });

  describe('show savedSegment in Edit mode', () => {
    it('should render queries with what being sent in props', async () => {
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
            <CreateSegment savedSegment={savedSegmentprops} />
          </RouterContext.Provider>
        );
      });
      const queries = screen.getAllByTestId('query-builder');

      const filterOneTextElements = getWhereElementsText(queries, 0);
      //first query -  `where properties.$city equals Chennai, Guwahati or 1 more
      expect(filterOneTextElements).toEqual([
        'where',
        'properties.$city',
        'equals',
        'Chennai, Guwahati or 1 more',
      ]);

      const filterTwoTextElements = getWhereElementsText(queries, 1);
      //first query -  `and properties.$app_version equals 1.5.5, 1.5.6
      expect(filterTwoTextElements).toEqual([
        'and',
        'properties.$app_version',
        'equals',
        '1.5.5, 1.5.6',
      ]);
    });

    it('should render table data with response coming from backend', async () => {
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
            <CreateSegment savedSegment={savedSegmentprops} />
          </RouterContext.Provider>
        );
      });

      const segmentTable = screen.getByTestId('segment-table');
      const segmentTableHeaders = screen.getAllByTestId(
        'segment-table-headers'
      );
      const segmentTableRows = screen.getAllByTestId('segment-table-body-rows');

      expect(segmentTable).toBeInTheDocument();
      segmentTableHeaders.forEach((header, i) => {
        expect(header).toHaveTextContent(savedSegmentprops.columns[i]);
      });
      // should have 3 data rows as users count is 3
      expect(segmentTableRows.length).toEqual(3);
      const firstRowTableCellsData = Array.from(
        segmentTableRows[0].getElementsByTagName('td')
      ).map((cell) => cell.textContent);
      expect(firstRowTableCellsData).toEqual([
        'sabiha6514@gmail.com',
        'Chennai',
        '1.5.5',
      ]);

      const secondRowTableCellsData = Array.from(
        segmentTableRows[1].getElementsByTagName('td')
      ).map((cell) => cell.textContent);
      expect(secondRowTableCellsData).toEqual([
        'bordoloidebojit69@gmail.com',
        'Guwahati',
        '1.5.5',
      ]);

      const thirdRowTableCellsData = Array.from(
        segmentTableRows[2].getElementsByTagName('td')
      ).map((cell) => cell.textContent);
      expect(thirdRowTableCellsData).toEqual([
        '4f36e6e5-3534-4e54-976a-fdcc6369a6e6',
        'Patna',
        '1.5.6',
      ]);
    });
  });

  describe('filter conditions ', () => {
    it(`should add new filter condition as 'and' initially after where`, async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      const selectPropertyDropdownOption = async (optionIndex: number) => {
        await act(async () => {
          const dropdownOptions = screen.getAllByTestId('dropdown-options');
          fireEvent.click(dropdownOptions[optionIndex]);
        });
      };

      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      await selectPropertyDropdownOption(0);

      // add another filter, new added condition shpuld be 'and'
      fireEvent.click(addFilterButton);
      await selectPropertyDropdownOption(1);

      await waitFor(() => {
        const expectedFilterConditions = ['where', 'and'];
        assertFilterConditions(expectedFilterConditions);
      });
    });

    it('should be able to switch b/w and/or options for filter condition and after switching a new added filter should have the latest conditon value', async () => {
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
            <CreateSegment savedSegment={savedSegmentprops} />
          </RouterContext.Provider>
        );
      });

      const filterConditions = screen.getAllByTestId('filter-condition');
      const initialFilterConditions = ['where', 'and', 'and'];
      filterConditions.forEach((condition, i) => {
        expect(condition).toHaveTextContent(initialFilterConditions[i]);
      });
      // click first 'and' from filters
      fireEvent.click(filterConditions[1]);
      const filterConditionOptions = screen.getAllByTestId(
        'filter-conditions-options'
      );
      const options = ['and', 'or'];
      filterConditionOptions.forEach((option, i) => {
        expect(option).toHaveTextContent(options[i]);
      });

      //click on 'or' option to change all filter conditions to `or`
      await switchFilterCondition(1);
      await waitFor(() => {
        /// after clicking on 'or' option, all 'and' conditions should be 'or' now
        const expectedFilterConditions = ['where', 'or'];
        assertFilterConditions(expectedFilterConditions);
      });

      // add new filter, new added filter condition should be 'or'
      await addWhereFilter();

      await waitFor(async () => {
        const expectedNewFilterConditions = ['where', 'or', 'or'];
        assertFilterConditions(expectedNewFilterConditions);
      });

      // add new who filter
      await addWhoFilter(5);
      await addWhoFilter(6);
      await addWhoFilter(7);

      await waitFor(async () => {
        assertFilterConditions(['where', 'or', 'or', 'who', 'and', 'and']);
      });

      const newFilterConditions = screen.getAllByTestId('filter-condition');

      //click the last filterCondition option, which is the 'who' filter and switch all who conditions to 'or'
      fireEvent.click(newFilterConditions[4]);
      await switchFilterCondition(1);
      await waitFor(() => {
        assertFilterConditions(['where', 'or', 'or', 'who', 'or', 'or']);
      });

      // click on where's first or condition and change it to 'and'
      fireEvent.click(newFilterConditions[1]);
      await switchFilterCondition(0);
      await waitFor(() => {
        // all where conditions should have 'and' and who conditions should have 'or
        assertFilterConditions(['where', 'and', 'and', 'who', 'or', 'or']);
      });
    });
  });

  describe('save segment', () => {
    it('should be able to save segment and redirect the user to edit segment page', async () => {
      const router = createMockRouter({
        pathname: '/analytics/segment/create/[dsId]',
        query: { dsId: '654212033222' },
      });

      mockedSaveSegment.mockReturnValue({
        status: 200,
        data: {
          _id: '654212033111',
          name: 'Test Segment',
          datasourceId: '654212033222',
          description: 'Dummy segment to test segment component',
          groups: [
            {
              filters: [
                {
                  condition: SegmentFilterConditions.WHERE,
                  operand: 'device',
                  operator: 'equals',
                  values: ['android', 'ios', 'mac', 'windows'],
                },
              ],
              condition: SegmentGroupConditions.AND,
            },
          ],
        },
      });

      await act(async () => {
        render(
          <RouterContext.Provider value={router}>
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      // add a filter
      const addFilterButton = screen.getByTestId('add-filter');
      fireEvent.click(addFilterButton);
      const dropdownOptions = screen.getAllByTestId('dropdown-options');
      await act(async () => {
        fireEvent.click(dropdownOptions[1]);
      });
      const addPropertyValuesButton = screen.getByTestId(
        'add-event-property-values'
      );
      const selectAllCheckbox = screen.getByTestId('select-all-values');
      fireEvent.click(selectAllCheckbox);
      await act(async () => {
        fireEvent.click(addPropertyValuesButton);
      });

      // open save modal to save segment
      const openSaveSegmentModalButton = screen.getByTestId(
        'open-save-segment-modal'
      );
      fireEvent.click(openSaveSegmentModalButton);

      const segmentNameInput = screen.getByTestId('segment-name');
      const segmentDesciptionInput = screen.getByTestId('segment-description');
      const saveSegmentButton = screen.getByTestId('save-segment');

      await act(async () => {
        // add segment name and description
        fireEvent.change(segmentNameInput, {
          target: { value: 'Test Segment' },
        });
        fireEvent.change(segmentDesciptionInput, {
          target: { value: 'Dummy segment to test segment component' },
        });
        fireEvent.click(saveSegmentButton);
      });

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/segment/edit/[segmentId]',
          query: { dsId: '654212033222', segmentId: '654212033111' },
        });
      });
    });

    it('should be able to edit segment and update the segment once click on save button and then redirect the user to edit segment page', async () => {
      const router = createMockRouter({
        pathname: '/analytics/segment/edit',
        query: { dsId: '654212033222' },
      });

      mockedUpdateSegment.mockReturnValue({
        status: 200,
        data: {
          _id: '654212033111',
          name: 'Test Segment Edited',
          datasourceId: '654212033222',
          description: 'Dummy segment to test segment component',
          groups: [
            {
              filters: [
                {
                  condition: SegmentFilterConditions.WHERE,
                  operand: 'properties.$city',
                  operator: 'equals',
                  values: ['Chennai', 'Guwahati', 'Patna'],
                  type: FilterType.WHERE,
                },
                {
                  condition: SegmentFilterConditions.AND,
                  operand: 'properties.$app_version',
                  operator: 'equals',
                  values: ['1.5.5', '1.5.6'],
                  type: FilterType.WHERE,
                },
                {
                  condition: SegmentFilterConditions.WHO,
                  triggered: true,
                  operand: 'App_Open',
                  aggregation: 'total',
                  operator: 'equals',
                  values: ['1'],
                  startDate: '2022-11-28',
                  endDate: '2022-12-28',
                  type: FilterType.WHO,
                },
              ],
              condition: SegmentGroupConditions.AND,
            },
          ],
        },
      });

      await act(async () => {
        render(
          <RouterContext.Provider value={router}>
            <CreateSegment />
          </RouterContext.Provider>
        );
      });

      // add a filter to enable save button
      await addWhoFilter();

      // open save modal to save segment
      const openSaveSegmentModalButton = screen.getByTestId(
        'open-save-segment-modal'
      );
      fireEvent.click(openSaveSegmentModalButton);

      const segmentNameInput = screen.getByTestId('segment-name');
      const saveSegmentButton = screen.getByTestId('save-segment');

      await act(async () => {
        // add segment name and description
        fireEvent.change(segmentNameInput, {
          target: { value: 'Test Segment' },
        });
        fireEvent.click(saveSegmentButton);
      });

      await waitFor(() => {
        expect(mockedUpdateSegment).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/segment/edit/[segmentId]',
          query: { dsId: '654212033222', segmentId: '654212033111' },
        });
      });
    });
  });

  describe('remove filter conditons', () => {
    const savedSegmentProps = {
      appId: '638f1a928e54760eafc64d6e',
      columns: ['user_id', 'properties.$city', 'properties.$app_version'],
      createdAt: new Date('2022-12-19T09:04:44.566000'),
      datasourceId: '638f1aac8e54760eafc64d70',
      description: 'Dummy segment to test Edit segment component',
      groupConditions: [],
      groups: [
        {
          filters: [
            {
              condition: SegmentFilterConditions.WHERE,
              operand: 'properties.$city',
              operator: 'equals',
              values: ['Chennai', 'Guwahati', 'Patna'],
              type: FilterType.WHERE,
            },
            {
              condition: SegmentFilterConditions.AND,
              operand: 'properties.$app_version',
              operator: 'equals',
              values: ['1.5.5', '1.5.6'],
              type: FilterType.WHERE,
            },
            {
              condition: SegmentFilterConditions.WHO,
              triggered: true,
              operand: 'App_Open',
              aggregation: 'total',
              operator: 'equals',
              values: ['15'],
              startDate: '2022-11-28',
              endDate: '2022-12-28',
              type: FilterType.WHO,
            },
            {
              condition: SegmentFilterConditions.OR,
              triggered: true,
              operand: 'Login',
              aggregation: 'total',
              operator: 'equals',
              values: ['50'],
              startDate: '2022-11-28',
              endDate: '2022-12-28',
              type: FilterType.WHO,
            },
            {
              condition: SegmentFilterConditions.OR,
              triggered: true,
              operand: 'Video_Open',
              aggregation: 'total',
              operator: 'equals',
              values: ['10'],
              startDate: '2022-11-28',
              endDate: '2022-12-28',
              type: FilterType.WHO,
            },
          ] as SegmentFilter[],
          condition: SegmentGroupConditions.AND,
        },
      ],
      name: 'Testing edit Segments ',
      updatedAt: new Date('2022-12-19T09:04:44.567000'),
      userId: '638f1a128e54760eafc64d6c',
      _id: '63a0292cd9ae5bf509df9ac7',
    };

    it('remove filter condition and should be able to replace filter condition with suitable condition', async () => {
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
            <CreateSegment savedSegment={savedSegmentProps} />
          </RouterContext.Provider>
        );
      });

      // case 1: remove last filter;
      await removeFilter(4);
      await waitFor(() => {
        assertFilterConditions(['where', 'and', 'who', 'or']);
      });

      // case2: remove the filter with 'who' condition and after this the next 'or' condition should be modified to 'and'
      await removeFilter(2);
      await waitFor(() => {
        assertFilterConditions(['where', 'and', 'who']);
      });

      // case3: remove the first filter which is 'where', the next where type filter should have the condition now as 'where'
      await removeFilter(0);
      await waitFor(() => {
        assertFilterConditions(['where', 'who']);
      });

      // case4: remove all the filters, there removeFilter button should not be visible
      await removeFilter(1);
      await waitFor(() => {
        assertFilterConditions(['where']);
      });

      await removeFilter(0);
      expect(screen.queryByTestId('remove-filter')).not.toBeInTheDocument();
    });

    it('remove filter condition after switching the who filter conditions to `and` and then add new filters', async () => {
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
            <CreateSegment savedSegment={savedSegmentProps} />
          </RouterContext.Provider>
        );
      });

      const filterConditions = screen.getAllByTestId('filter-condition');

      // switch 'who' condition to 'and' from last 'or' condition
      fireEvent.click(filterConditions[4]);
      await switchFilterCondition(0);

      await removeFilter(4);
      await waitFor(() => {
        assertFilterConditions(['where', 'and', 'who', 'and']);
      });

      // add new 'who' filter, the condition should be 'and'
      await addWhoFilter(5);
      await waitFor(() => {
        assertFilterConditions(['where', 'and', 'who', 'and', 'and']);
      });

      const newfilterConditions = screen.getAllByTestId('filter-condition');
      // switch 'where' conditions to 'or' and then add new where condition
      fireEvent.click(newfilterConditions[1]);
      await switchFilterCondition(1);
      await waitFor(() => {
        assertFilterConditions(['where', 'or', 'who', 'and', 'and']);
      });
      await addWhereFilter();
      // new added condition should be 'or'
      await waitFor(() => {
        assertFilterConditions(['where', 'or', 'or', 'who', 'and', 'and']);
      });

      // remove first where filter, and remaining where filter condition should not be changed
      await removeFilter(0);
      await waitFor(() => {
        assertFilterConditions(['where', 'or', 'who', 'and', 'and']);
      });
    });
  });

  describe('add multiple groups and clear groups', () => {
    it('add group', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });
      await addWhereFilter();
      await addWhoFilter();

      // add new group
      const addGroupButton = screen.getByTestId('add-group');
      await act(async () => {
        fireEvent.click(addGroupButton);
      });

      const groups = screen.getAllByTestId('segment-group');

      expect(groups.length).toEqual(2);
      expect(getGroupConditionText()).toEqual(['AND']);
    });

    it('add groups and switch first `and` condition to `or`', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });
      await addWhereFilter();
      await addWhoFilter();

      // add two new group and then change first group condition to 'OR'
      const addGroupButton = screen.getByTestId('add-group');
      await act(async () => {
        fireEvent.click(addGroupButton);
      });
      await act(async () => {
        fireEvent.click(addGroupButton);
      });
      const groupConditions = screen.getAllByTestId('group-condition');
      expect(getGroupConditionText()).toEqual(['AND', 'AND']);

      // switch first 'AND' condition to 'OR'
      await act(async () => {
        fireEvent.click(groupConditions[0]);
      });
      expect(getGroupConditionText()).toEqual(['OR', 'AND']);

      // again clicking on same condition would change the text back to 'AND' from 'OR'
      await act(async () => {
        fireEvent.click(groupConditions[0]);
      });
      expect(getGroupConditionText()).toEqual(['AND', 'AND']);
    });

    it('clear all group ', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '654212033222' } })}
          >
            <CreateSegment />
          </RouterContext.Provider>
        );
      });
      await addWhereFilter();
      await addWhoFilter();

      const addGroupButton = screen.getByTestId('add-group');
      await act(async () => {
        fireEvent.click(addGroupButton);
      });
      await act(async () => {
        fireEvent.click(addGroupButton);
      });

      const groups = screen.getAllByTestId('segment-group');
      expect(groups.length).toEqual(3);

      const clearAllButton = screen.getByTestId('clear-all');

      // after clicking on clear-all only one group should be there with no filters/queries
      await act(async () => {
        fireEvent.click(clearAllButton);
      });
      const newGroup = screen.getAllByTestId('segment-group');
      const queries = screen.queryByTestId('query-builder');

      expect(newGroup.length).toEqual(1);
      expect(queries).not.toBeInTheDocument();
    });
  });
});
