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

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/utils/common');

describe('Create Segment', () => {
  let mockedGetEventProperties: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;

  beforeEach(() => {
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);

    mockedGetEventProperties.mockReturnValue([
      'city',
      'device',
      'country',
      'app_version',
      'session_length',
    ]);
    mockedGetEventPropertiesValue.mockReturnValue([
      ['android'],
      ['ios'],
      ['mac'],
      ['windows'],
    ]);
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

  describe('select event property ', () => {
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
});
