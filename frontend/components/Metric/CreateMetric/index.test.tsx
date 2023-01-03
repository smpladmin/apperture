import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import {
  getEventProperties,
  getEventPropertiesValue,
  getNodes,
} from '@lib/services/datasourceService';
import { computeMetric } from '@lib/services/metricService';
import { getUserInfo } from '@lib/services/userService';
import CreateMetric from './index';

jest.mock('@lib/services/datasourceService');
jest.mock('@lib/services/metricService');

describe('Create Metric', () => {
  let mockedGetEventProperties: jest.Mock;
  let mockedGetNodes: jest.Mock;
  let mockedGetEventPropertiesValue: jest.Mock;
  let mockedComputedMetric: jest.Mock;
  //   let mockedGetUserInfo: jest.Mock;
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

  const computedMetricResponse = {
    metric: [
      {
        date: '2022-10-07',
        value: 96,
      },
      {
        date: '2022-10-08',
        value: 135,
      },
      {
        date: '2022-10-09',
        value: 178,
      },
      {
        date: '2022-10-10',
        value: 190,
      },
      {
        date: '2022-10-11',
        value: 115,
      },
      {
        date: '2022-10-12',
        value: 126,
      },
    ],
  };

  beforeEach(() => {
    mockedGetEventProperties = jest.mocked(getEventProperties);
    mockedGetNodes = jest.mocked(getNodes);
    mockedGetEventPropertiesValue = jest.mocked(getEventPropertiesValue);
    mockedComputedMetric = jest.mocked(computeMetric);
    // mockedGetUserInfo = jest.mocked(getUserInfo);

    mockedGetEventProperties.mockReturnValue(eventProperties);
    mockedGetNodes.mockReturnValue(events);
    mockedGetEventPropertiesValue.mockReturnValue([
      ['android'],
      ['ios'],
      ['mac'],
      ['windows'],
    ]);
    mockedComputedMetric.mockReturnValue(computedMetricResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('render create metric component', () => {
    it('should render the metric component', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({ query: { dsId: '' } })}
          >
            <CreateMetric />
          </RouterContext.Provider>
        );
      });
      const metricBackButton = screen.getByTestId('back-button');
      const metricSaveButton = screen.getByTestId('save');
      expect(metricBackButton).toBeInTheDocument();
      expect(metricSaveButton).toBeInTheDocument();
      expect(metricSaveButton).toBeDisabled();
    });
  });

  it('should add new EventsOrSegment Components on the click of + button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });
    const addEventsOrSegmentsButton = screen.getByTestId(
      'add-events-or-segments-button'
    );
    const EventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );
    fireEvent.click(addEventsOrSegmentsButton);
    const newEventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );
    expect(EventsOrSegmentsList.length + 1).toEqual(
      newEventsOrSegmentsList.length
    );
    const EventsOrSegmentsVariablesList = screen.getAllByTestId(
      'event-or-segment-component-variable'
    );
    expect(EventsOrSegmentsVariablesList.map((el) => el.textContent)).toEqual([
      'A',
      'B',
    ]);
  });

  it('should remove EventsOrSegment Components on the click of x button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });
    const addEventsOrSegmentsButton = screen.getByTestId(
      'add-events-or-segments-button'
    );
    const removeEventsOrSegmentsButton = screen.getByTestId(
      'remove-event-or-segment-component'
    );
    const EventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );
    fireEvent.click(addEventsOrSegmentsButton);
    fireEvent.click(removeEventsOrSegmentsButton);
    const newEventsOrSegmentsList = screen.getAllByTestId(
      'event-or-segment-component'
    );
    const EventsOrSegmentsVariablesList = screen.getAllByTestId(
      'event-or-segment-component-variable'
    );
    expect(EventsOrSegmentsList.length).toEqual(newEventsOrSegmentsList.length);
    expect(EventsOrSegmentsVariablesList.map((el) => el.textContent)).toEqual([
      'A',
    ]);
  });

  it('should show event name, after selecting it from the dropdown list', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const EventDropDown = screen.getByTestId(
      'event-property-dropdown-container'
    );
    const SELECTED_OPTION = 1;
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');
    expect(EventNameDropdownList.map((el) => el.textContent)).toEqual(
      events.map((event) => event.id)
    );
    expect(EventDropDown).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });
    const eventName = screen.getByTestId('event-or-segment-name');
    expect(eventName.textContent).toEqual(
      EventNameDropdownList[SELECTED_OPTION].textContent
    );
  });

  it('should add filter section after clicking on add filter button', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });

    //Adding a filter to the "Event or Segment" Component
    const AddFilterButton = screen.getByTestId('add-filter-button');
    fireEvent.click(AddFilterButton);
    const EventPropertyDropdownList = screen.getAllByTestId('dropdown-options');
    await act(async () => {
      fireEvent.click(EventPropertyDropdownList[SELECTED_OPTION]);
    });
    const EventFilterComponent = screen.getByTestId('event-filter-component');
    expect(EventFilterComponent).toBeInTheDocument();
  });

  it('should be able to select value for the filter', async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ query: { dsId: '' } })}
        >
          <CreateMetric />
        </RouterContext.Provider>
      );
    });
    const SelectEvent = screen.getByTestId('select-event-segment');
    fireEvent.click(SelectEvent);
    const EventOption = screen.getByTestId('event-option');
    fireEvent.click(EventOption);
    const SELECTED_OPTION = 1;

    // Selecting an event from the dropdown
    const EventNameDropdownList = screen.getAllByTestId('dropdown-options');

    await act(async () => {
      fireEvent.click(EventNameDropdownList[SELECTED_OPTION]);
    });

    //Adding a filter to the "Event or Segment" Component
    const AddFilterButton = screen.getByTestId('add-filter-button');
    fireEvent.click(AddFilterButton);
    const EventPropertyDropdownList = screen.getAllByTestId('dropdown-options');
    await act(async () => {
      fireEvent.click(EventPropertyDropdownList[SELECTED_OPTION]);
    });

    const EventFilterValue = screen.getByTestId('event-filter-values');

    expect(EventFilterValue.textContent).toEqual('Select value');
    fireEvent.click(EventFilterValue);

    const EventPropertyValueDropdownList = screen.getAllByTestId(
      'property-value-dropdown-option'
    );
    const AddPropertyValueButton = screen.getByTestId(
      'add-event-property-values'
    );
    await act(async () => {
      fireEvent.click(EventPropertyValueDropdownList[SELECTED_OPTION]);
      fireEvent.click(AddPropertyValueButton);
    });
    expect(EventFilterValue.textContent).toEqual(
      EventPropertyValueDropdownList[SELECTED_OPTION].textContent
    );
  });
});
