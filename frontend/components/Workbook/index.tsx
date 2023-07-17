import React, { useEffect, useState } from 'react';
import WorkbookHeader from './components/Header';
import { saveWorkbook, updateWorkbook } from '@lib/services/workbookService';
import { useRouter } from 'next/router';
import { SubHeaderColumnType, TransientSheetData } from '@lib/domain/workbook';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import SidePanel from './components/SidePanel';
import Grid from '@components/Spreadsheet/components/Grid/Grid';
import Footer from '@components/Spreadsheet/components/Footer';
import QueryEditor from './components/QueryEditor';
import SelectSheet from './components/SelectSheet';
import EmptySheet from './components/EmptySheet';

const Workbook = ({ savedWorkbook }: { savedWorkbook?: any }) => {
  const [workbookName, setWorkBookName] = useState('Untitled');
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [isWorkbookBeingEdited, setIsWorkbookBeingEdited] = useState(false);
  const [sheetsData, setSheetsData] = useState<TransientSheetData[]>([
    {
      name: 'Sheet 1',
      query: 'Select user_id, count() from events group by user_id',
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
      is_sql: false,
    },
  ]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
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

  return (
    <Flex direction={'column'}>
      <WorkbookHeader
        name={workbookName}
        setName={setWorkBookName}
        isSaveButtonDisabled={isSaveButtonDisabled}
        handleSave={handleSaveOrUpdateWorkbook}
        setShowSqlEditor={setShowSqlEditor}
      />
      <Flex direction={'row'} h={'full'}>
        {showSelectSheetOverlay ? (
          <SelectSheet
            closeSelectSheetOverlay={closeSelectSheetOverlay}
            sheetsData={sheetsData}
          />
        ) : null}
        <SidePanel />

        <Box h={'full'} overflowY={'auto'}>
          {/* <Box>
            {showSqlEditor ? (
              <QueryEditor
                sheetsData={sheetsData}
                setShowSqlEditor={setShowSqlEditor}
                selectedSheetIndex={selectedSheetIndex}
                setSheetsData={setSheetsData}
              />
            ) : null}
            <Grid
              sheetData={sheetsData[0]}
              selectedSheetIndex={0}
              evaluateFormulaHeader={() => {}}
              addDimensionColumn={() => {}}
            />
          </Box> */}
          <EmptySheet />
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
