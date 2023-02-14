import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from 'tests/util';
import {
  saveAction,
  updateAction,
  getTransientActionEvents,
} from '@lib/services/actionService';
import { isValidAction } from '../utils';
import Action from './index';
import { CaptureEvent } from '@lib/domain/action';

jest.mock('@lib/services/actionService');
jest.mock('../utils');

describe('Actions', () => {
  const transientAPIResponse = {
    count: 2,
    data: [
      {
        event: '$autocapture',
        timestamp: '2023-02-09T04:50:47',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/app/create',
        source: 'web',
      },
      {
        event: '$autocapture',
        timestamp: '2023-02-07T08:45:13',
        uid: '1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa',
        url: 'http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc',
        source: 'web',
      },
    ],
  };

  const saveAPIResponse = {
    status: 200,
    data: {
      _id: '63d8ef5a7b02dbd1dcf20dc2',
      datasourceId: '63d8ef5a7b02dbd1dcf20dc3',
      name: 'Test',
      groups: [
        {
          href: '',
          selector: '__next>div',
          text: '',
          url: '',
          url_matching: '',
        },
      ],
    },
  };

  const props = {
    _id: '63d8ef5a7b02dbd1dcf20dc2',
    datasourceId: '63d8ef5a7b02dbd1dcf20dc3',
    appId: '63d8ef5a7b02dbd1dcf20dc4',
    name: 'Test Action',
    groups: [
      {
        href: '',
        selector: '__next>div',
        text: '',
        url: '',
        url_matching: '',
      },
    ],
    eventType: CaptureEvent.AUTOCAPTURE,
    updateAt: new Date('2023-02-02T14:00:06.464000'),
  };

  const renderActionComponent = async (
    router = createMockRouter({
      pathname: '/analytics/action/create',
      query: { dsId: '63d8ef5a7b02dbd1dcf20dc3' },
    })
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <Action />
        </RouterContext.Provider>
      );
    });
  };
  let mockedGetTransientActionEvents: jest.Mock;
  let mockedIsValidAction: jest.Mock;
  let mockedSaveAction: jest.Mock;
  let mockedUpdateAction: jest.Mock;

  beforeEach(() => {
    mockedGetTransientActionEvents = jest.mocked(getTransientActionEvents);
    mockedIsValidAction = jest.mocked(isValidAction);
    mockedSaveAction = jest.mocked(saveAction);
    mockedUpdateAction = jest.mocked(updateAction);

    mockedGetTransientActionEvents.mockReturnValue(transientAPIResponse);
    mockedIsValidAction.mockReturnValue(true);
    mockedSaveAction.mockReturnValue(saveAPIResponse);
    mockedUpdateAction.mockReturnValue(saveAPIResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('action header and form', () => {
    it('should action page with action name defaults to `Untitled Action and a form`', async () => {
      mockedIsValidAction.mockReturnValue(false);
      await renderActionComponent();

      const actionName = screen.getByTestId('action-name');
      const actionForm = screen.getByTestId('action-form');
      expect(actionName.textContent).toEqual('Untitled Action');
      expect(actionForm).toBeInTheDocument();
    });

    it('save button should be disabled when form input is empty i.e. invalid', async () => {
      mockedIsValidAction.mockReturnValue(false);
      await renderActionComponent();
      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toBeDisabled();
    });

    it('shows name input prefiiled with action name once click on pencil edit icon', async () => {
      await renderActionComponent();
      const actionNameEditButton = screen.getByTestId(
        'action-name-edit-button'
      );
      fireEvent.click(actionNameEditButton);
      const actionNameInput = screen.getByTestId('action-name-input');

      expect(actionNameInput).toBeVisible();
      expect(actionNameInput).toHaveDisplayValue('Untitled Action');
    });
  });

  describe('save and update funnel', () => {
    it('user gets redirected to edit page on click of save button while creating action', async () => {
      const router = createMockRouter({
        pathname: '/analytics/action/create',
        query: { dsId: '63d8ef5a7b02dbd1dcf20dc3' },
      });

      await renderActionComponent(router);
      const cssSelectorInput = screen.getByTestId('css-selector-input');
      fireEvent.change(cssSelectorInput, { target: { value: '__next>div' } });
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockedSaveAction).toHaveBeenCalledTimes(1);
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/action/edit/[actionId]',
          query: {
            actionId: '63d8ef5a7b02dbd1dcf20dc2',
            dsId: '63d8ef5a7b02dbd1dcf20dc3',
          },
        });
      });
    });

    it('action should be updated when click on save button on edit page', async () => {
      const router = createMockRouter({
        pathname: '/analytics/action/edit',
        query: { actionId: '63d8ef5a7b02dbd1dcf20dc2' },
      });

      await renderActionComponent(router);
      const cssSelectorInput = screen.getByTestId('css-selector-input');
      fireEvent.change(cssSelectorInput, { target: { value: '__next>div' } });
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockedUpdateAction).toHaveBeenCalledTimes(1);
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/action/edit/[actionId]',
          query: {
            actionId: '63d8ef5a7b02dbd1dcf20dc2',
            dsId: '63d8ef5a7b02dbd1dcf20dc3',
          },
        });
      });
    });
  });

  describe('show transient event table ', () => {
    it('shows table tranient event data', async () => {
      await renderActionComponent();
      const cssSelectorInput = screen.getByTestId('css-selector-input');
      fireEvent.change(cssSelectorInput, {
        target: { value: '__next>div' },
      });

      await waitFor(() => {
        expect(mockedGetTransientActionEvents).toHaveBeenCalledWith(
          '63d8ef5a7b02dbd1dcf20dc3',
          [
            {
              href: '',
              selector: '__next>div',
              text: '',
              url: '',
              url_matching: '',
            },
          ],
          '$autocapture'
        );
        const eventsTable = screen.getByTestId('listing-table');
        const eventTableBodyRows = screen.getAllByTestId(
          'listing-table-body-rows'
        );
        expect(eventsTable).toBeInTheDocument();
        // table rows equal to response coming from transient action events call
        expect(eventTableBodyRows.length).toEqual(2);
      });
    });

    it('prefill name input and selector input field on edit mode when props are present', async () => {
      await act(async () => {
        render(
          <RouterContext.Provider
            value={createMockRouter({
              pathname: '/analytics/action/edit',
              query: { actionId: '63d8ef5a7b02dbd1dcf20dc2' },
            })}
          >
            <Action savedAction={props} />
          </RouterContext.Provider>
        );
      });
      const actionName = screen.getByTestId('action-name');
      const cssSelectorInput = screen.getByTestId('css-selector-input');

      expect(actionName.textContent).toEqual('Test Action');
      expect(cssSelectorInput).toHaveDisplayValue('__next>div');
    });
  });
});
