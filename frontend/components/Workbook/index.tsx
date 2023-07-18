import React, { useEffect, useState } from 'react';
import WorkbookHeader from './components/Header';
import {
  getTransientSpreadsheets,
  saveWorkbook,
  updateWorkbook,
} from '@lib/services/workbookService';
import { useRouter } from 'next/router';
import { SubHeaderColumnType, TransientSheetData } from '@lib/domain/workbook';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import SidePanel from './components/SidePanel';
import Grid from '@components/Spreadsheet/components/Grid/Grid';
import Footer from '@components/Spreadsheet/components/Footer';
import QueryEditor from './components/QueryEditor';
import SelectSheet from './components/SelectSheet';
import EmptySheet from './components/EmptySheet';
import { getConnectionsForApp } from '@lib/services/connectionService';
import { cloneDeep } from 'lodash';
import { ErrorResponse } from '@lib/services/util';

const Workbook = ({ savedWorkbook }: { savedWorkbook?: any }) => {
  const [workbookName, setWorkBookName] = useState('Untitled Workbook');
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [isWorkbookBeingEdited, setIsWorkbookBeingEdited] = useState(false);
  const [sheetsData, setSheetsData] = useState<TransientSheetData[]>([
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
    },
  ]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(
    savedWorkbook ? false : true
  );
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    if (!sheetData?.query) return;

    const fetchTransientSheetData = async () => {
      setSaveButtonDisabled(true);
      setIsLoading(true);

      const response = await getTransientSpreadsheets(
        dsId as string,
        sheetData.query,
        sheetData.is_sql
      );

      setIsLoading(false);
      setSaveButtonDisabled(false);

      if (response.status === 200) {
        const toUpdateSheets = cloneDeep(sheetsData);
        toUpdateSheets[selectedSheetIndex].data = response?.data?.data;
        toUpdateSheets[selectedSheetIndex].headers = response?.data?.headers;
        setSheetsData(toUpdateSheets);
        setError('');
      } else {
        setError((response as ErrorResponse)?.error?.detail);
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
          />
        ) : null}
        <SidePanel
          connections={connections}
          selectedSheetIndex={selectedSheetIndex}
          sheetsData={sheetsData}
          setSheetsData={setSheetsData}
          setShowEmptyState={setShowEmptyState}
          setShowSqlEditor={setShowSqlEditor}
        />

        <Box h={'full'} overflowY={'auto'}>
          {showEmptyState ? (
            <EmptySheet />
          ) : (
            <>
              {showSqlEditor ? (
                <QueryEditor
                  sheetsData={sheetsData}
                  error={error}
                  selectedSheetIndex={selectedSheetIndex}
                  setError={setError}
                  setShowSqlEditor={setShowSqlEditor}
                  setSheetsData={setSheetsData}
                />
              ) : null}

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
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Workbook;
