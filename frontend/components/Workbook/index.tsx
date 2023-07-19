import React, { useEffect, useState } from 'react';
import WorkbookHeader from './components/Header';
import {
  getTransientSpreadsheets,
  saveWorkbook,
  updateWorkbook,
} from '@lib/services/workbookService';
import { useRouter } from 'next/router';
import {
  SubHeaderColumnType,
  TransientSheetData,
  Workbook,
} from '@lib/domain/workbook';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import SidePanel from './components/SidePanel';
import Grid from '@components/Spreadsheet/components/Grid/Grid';
import Footer from '@components/Spreadsheet/components/Footer';
import QueryEditor from './components/QueryEditor';
import SelectSheet from './components/SelectSheet';
import EmptySheet from './components/EmptySheet';
import { getConnectionsForApp } from '@lib/services/connectionService';
import { cloneDeep } from 'lodash';

const initializeSheetForSavedWorkbook = (savedWorkbook?: Workbook) => {
  if (savedWorkbook) {
    return savedWorkbook.spreadsheets.map((sheet) => ({
      ...sheet,
      data: [],
      subHeaders: sheet.subHeaders
        ? sheet.subHeaders
        : Array.from({ length: 27 }).map((_, index) => {
            return {
              name: '',
              type:
                index === 1 || index === 2
                  ? SubHeaderColumnType.DIMENSION
                  : SubHeaderColumnType.METRIC,
            };
          }),
      editMode: sheet?.editMode || true,
      meta: sheet?.meta || {
        dsId: '',
        selectedColumns: [],
      },
    }));
  }
  return [
    {
      name: 'Sheet 1',
      query: '',
      data: [],
      headers: [],
      subHeaders: Array.from({ length: 27 }).map((_, index) => {
        return {
          name: '',
          type:
            index === 1 || index === 2
              ? SubHeaderColumnType.DIMENSION
              : SubHeaderColumnType.METRIC,
        };
      }),
      is_sql: true,
      editMode: false,
      meta: {
        dsId: '',
        selectedColumns: [],
      },
    },
  ];
};

const Workbook = ({ savedWorkbook }: { savedWorkbook?: Workbook }) => {
  const [workbookName, setWorkBookName] = useState('Untitled Workbook');
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [isWorkbookBeingEdited, setIsWorkbookBeingEdited] = useState(false);
  const [sheetsData, setSheetsData] = useState<TransientSheetData[]>(
    initializeSheetForSavedWorkbook(savedWorkbook)
  );
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(
    savedWorkbook ? false : true
  );
  const [connections, setConnections] = useState([]);
  const [showColumns, setShowColumns] = useState(false);

  const {
    isOpen: showSelectSheetOverlay,
    onOpen: openSelectSheetOverlay,
    onClose: closeSelectSheetOverlay,
  } = useDisclosure({ defaultIsOpen: savedWorkbook ? false : true });

  const router = useRouter();
  const { dsId, workbookId } = router.query;

  useEffect(() => {
    if (router.pathname.includes('edit')) setIsWorkbookBeingEdited(true);
  }, []);

  const handleSaveOrUpdateWorkbook = async () => {
    const sheets = sheetsData.map((sheet) => {
      return {
        name: sheet.name,
        is_sql: sheet.is_sql,
        headers: sheet.headers,
        query: sheet.query,
        subHeaders: sheet.subHeaders,
        editMode: sheet.editMode,
        meta: sheet.meta,
      };
    });

    const { status, data } = isWorkbookBeingEdited
      ? await updateWorkbook(
          workbookId as string,
          dsId as string,
          workbookName,
          sheets
        )
      : await saveWorkbook(dsId as string, workbookName, sheets);

    if (status === 200) {
      router.push({
        pathname: '/analytics/workbook/edit/[workbookId]',
        query: { workbookId: data?._id || workbookId, dsId },
      });
      setSaveButtonDisabled(true);
    } else {
      setSaveButtonDisabled(false);
    }
  };

  useEffect(() => {
    const fetchConnections = async () => {
      const res = await getConnectionsForApp(dsId as string);
      setConnections(res);
    };
    fetchConnections();
  }, [dsId]);

  useEffect(() => {
    const sheetData = sheetsData[selectedSheetIndex];

    if (sheetData?.query) setShowEmptyState(false);
    if (!sheetData?.query || sheetData.editMode) return;

    const fetchTransientSheetData = async () => {
      const response = await getTransientSpreadsheets(
        dsId as string,
        sheetData.query,
        sheetData.is_sql
      );

      if (response.status === 200) {
        const toUpdateSheets = cloneDeep(sheetsData);
        toUpdateSheets[selectedSheetIndex].data = response?.data?.data;
        toUpdateSheets[selectedSheetIndex].headers = response?.data?.headers;
        setSheetsData(toUpdateSheets);
      }
    };

    fetchTransientSheetData();
  }, [sheetsData[selectedSheetIndex]?.query]);

  return (
    <Flex direction={'column'}>
      <WorkbookHeader
        name={workbookName}
        setName={setWorkBookName}
        isSaveButtonDisabled={isSaveButtonDisabled}
        handleSave={handleSaveOrUpdateWorkbook}
        setShowSqlEditor={setShowSqlEditor}
      />
      <Flex
        direction={'row'}
        h={'full'}
        overflow={showEmptyState ? 'hidden' : 'auto'}
      >
        {showSelectSheetOverlay ? (
          <SelectSheet
            closeSelectSheetOverlay={closeSelectSheetOverlay}
            sheetsData={sheetsData}
            setSheetsData={setSheetsData}
            setSelectedSheetIndex={setSelectedSheetIndex}
          />
        ) : null}
        <SidePanel
          showColumns={showColumns}
          setShowColumns={setShowColumns}
          connections={connections}
          selectedSheetIndex={selectedSheetIndex}
          sheetsData={sheetsData}
          setSheetsData={setSheetsData}
          setShowEmptyState={setShowEmptyState}
          setShowSqlEditor={setShowSqlEditor}
        />

        <Box h={'full'} overflowY={'auto'}>
          {showSqlEditor ? (
            <QueryEditor
              sheetsData={sheetsData}
              selectedSheetIndex={selectedSheetIndex}
              setShowSqlEditor={setShowSqlEditor}
              setSheetsData={setSheetsData}
            />
          ) : null}
          {showEmptyState ? (
            <EmptySheet />
          ) : (
            <>
              <Grid
                sheetData={sheetsData[selectedSheetIndex]}
                selectedSheetIndex={selectedSheetIndex}
                evaluateFormulaHeader={() => {}}
                addDimensionColumn={() => {}}
              />
            </>
          )}
          <Footer
            openSelectSheetOverlay={openSelectSheetOverlay}
            selectedSheetIndex={selectedSheetIndex}
            setSelectedSheetIndex={setSelectedSheetIndex}
            setSheetsData={setSheetsData}
            sheetsData={sheetsData}
            setShowColumns={setShowColumns}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Workbook;
