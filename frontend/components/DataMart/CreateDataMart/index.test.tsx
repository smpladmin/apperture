import {
  fireEvent,
  render,
  screen,
  act,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import DataMartComponent from './index';
import { createMockRouter } from 'tests/util';
import { MapContext } from '@lib/contexts/mapContext';
import { Node } from '@lib/domain/node';
import {
  computeDataMartQuery,
  getSavedDataMartsForDatasourceId,
  saveDataMartTable,
  updateDataMartTable,
} from '@lib/services/dataMartService';
import { DataMartObj } from '@lib/domain/datamart';
import { ColumnType } from '@lib/domain/workbook';

jest.mock('@lib/services/dataMartService');

describe('create datamart', () => {
  let mockComputeDataMartQuery: jest.Mock;
  let mockSaveDataMartTable: jest.Mock;
  let mockUpdateDataMartTable: jest.Mock;
  let mockGetSavedDataMartsForDatasourceId: jest.Mock;

  const props: DataMartObj = {
    _id: '64834034092324',
    appId: '645439584475',
    datasourceId: '654212033222',
    name: 'Test Table',
    query: 'select event_name from events',
    lastRefreshed: new Date(),
  };

  const renderDataMart = async (
    router = createMockRouter({
      pathname: '/analytics/datamart/create',
      query: { dsId: '654212033222' },
    }),
    renderWithProps = false,
    savedDataMart = props
  ) => {
    await act(async () => {
      render(
        <RouterContext.Provider value={router}>
          <MapContext.Provider
            value={{
              state: {
                nodes: [
                  {
                    id: 'Video_Click',
                    name: 'Video_Click',
                    source: 'mixpanel',
                    properties: [
                      { name: 'city', type: 'default' },
                      { name: 'device', type: 'default' },
                      { name: 'country', type: 'default' },
                      { name: 'app_version', type: 'default' },
                      { name: 'session_length', type: 'default' },
                    ],
                  },
                  {
                    id: 'Chapter_Click',
                    name: 'Video_Click',
                    source: 'mixpanel',
                    properties: [
                      { name: 'city', type: 'default' },
                      { name: 'device', type: 'default' },
                      { name: 'country', type: 'default' },
                      { name: 'app_version', type: 'default' },
                      { name: 'session_length', type: 'default' },
                    ],
                  },
                  {
                    id: 'Topic_Click',
                    name: 'Video_Click',
                    source: 'mixpanel',
                    properties: [
                      { name: 'city', type: 'default' },
                      { name: 'device', type: 'default' },
                      { name: 'country', type: 'default' },
                      { name: 'app_version', type: 'default' },
                      { name: 'session_length', type: 'default' },
                    ],
                  },
                ] as Node[],
                nodesData: [],
                activeNode: null,
                isNodeSearched: false,
              },
              dispatch: () => {},
            }}
          >
            {renderWithProps ? (
              <DataMartComponent savedDataMart={savedDataMart} />
            ) : (
              <DataMartComponent />
            )}
          </MapContext.Provider>
        </RouterContext.Provider>
      );
    });
  };

  beforeEach(() => {
    mockComputeDataMartQuery = jest.mocked(computeDataMartQuery);
    mockSaveDataMartTable = jest.mocked(saveDataMartTable);
    mockUpdateDataMartTable = jest.mocked(updateDataMartTable);
    mockGetSavedDataMartsForDatasourceId = jest.mocked(
      getSavedDataMartsForDatasourceId
    );

    mockComputeDataMartQuery.mockReturnValue({
      status: 200,
      data: {
        headers: [{ name: 'event_name', type: ColumnType.QUERY_HEADER }],
        data: [
          {
            index: 1,
            event_name: 'Video_Seen',
          },
          {
            index: 2,
            event_name: 'Thumbs_Up',
          },
          {
            index: 3,
            event_name: 'WebView_Open',
          },
          {
            index: 4,
            event_name: 'Video_Seen',
          },
          {
            index: 5,
            event_name: 'AppOpen',
          },
        ],
      },
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => jest.clearAllMocks());

  describe('create datamart table action', () => {
    it('should render sql code editor', async () => {
      await renderDataMart();
      const sqlEditor = screen.getByTestId('sql-editor');
      expect(sqlEditor).toBeInTheDocument();

      const usersCount = screen.getByTestId('users-count');
      const listingTable = screen.getByTestId('listing-table');
      expect(usersCount).toHaveTextContent('5 Events');
      expect(listingTable).toBeInTheDocument();

      const listingTableBodyRows = screen.getAllByTestId(
        'listing-table-body-rows'
      );
      expect(listingTableBodyRows.length).toEqual(5);
    });

    it('should fetch data on executing valid SQL query', async () => {
      await renderDataMart();
      const runButton = screen.getByTestId('run');
      fireEvent.click(runButton);
      expect(mockComputeDataMartQuery).toBeCalled();
    });
  });

  describe('save/update datamart', () => {
    const router = createMockRouter({
      query: { dsId: '654212033222' },
      pathname: '/analytics/retention/create',
    });

    it('should save the datamart table on clicking save and redirect to edit page', async () => {
      mockSaveDataMartTable.mockReturnValue({
        status: 200,
        data: {
          _id: '64349843748',
          datasourceId: '654212033222',
          query: 'select event_name from events',
          name: 'Untitled Table',
        },
      });

      await renderDataMart(router);
      const runButton = screen.getByTestId('run');
      fireEvent.click(runButton);
      const saveButton = screen.getByTestId('save');
      await act(async () => {
        fireEvent.click(saveButton);
      });
      expect(mockComputeDataMartQuery).toBeCalled();
      expect(mockSaveDataMartTable).toBeCalled();

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/analytics/datamart/edit/[dataMartId]',
          query: { dataMartId: '64349843748', datasourceId: '654212033222' },
        });
      });
    });

    it('should not be redirected to retention page if save retention case fails', async () => {
      mockSaveDataMartTable.mockReturnValue({
        status: 500,
        data: {},
      });
      await renderDataMart();

      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledTimes(0);
      });
    });

    it('should update the datamart table on clicking update button on edit page', async () => {
      mockUpdateDataMartTable.mockReturnValue({
        status: 200,
        data: {
          _id: '64349843748',
          datasourceId: '654212033222',
          query: 'select event_name from events',
          name: 'Updated Table',
        },
      });

      const router = createMockRouter({
        pathname: '/analytics/datamart/edit/[dataMartId]',
        query: { dataMartId: '64349843748', datasourceId: '654212033222' },
      });

      await renderDataMart(router);

      const updateButton = screen.getByTestId('save');
      fireEvent.click(updateButton);

      expect(mockUpdateDataMartTable).toHaveBeenCalled();
    });
  });
});
