import React, { useCallback, useEffect, useState } from 'react';
import Grid from './components/Grid/Grid';
import QueryModal from './components/QueryModal';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import {
  ColumnType,
  SpreadSheetColumn,
  SubHeaderColumnType,
  TransientSheetData,
  Workbook,
} from '@lib/domain/workbook';
import Footer from './components/Footer';
import {
  evaluateExpression,
  expressionTokenRegex,
  isOperand,
  isdigit,
} from './util';
import cloneDeep from 'lodash/cloneDeep';
import {
  getTransientSpreadsheets,
  saveWorkbook,
  updateWorkbook,
} from '@lib/services/workbookService';
import LoadingSpinner from '@components/LoadingSpinner';

const initializeSheetForSavedWorkbook = (savedWorkbook?: Workbook) => {
  if (savedWorkbook) {
    return savedWorkbook.spreadsheets.map((sheet) => ({
      ...sheet,
      data: [],
    }));
  }
  return [
    {
      name: 'Sheet 1',
      query: 'Select user_id, count() from events group by user_id',
      data: [],
      headers: [],
      subHeaders: Array.from({ length: 27 }).map((_, index) => {
        return {
          name: '',
          type:
            index === 1
              ? SubHeaderColumnType.DIMENSION
              : SubHeaderColumnType.METRIC,
        };
      }),
      is_sql: true,
    },
  ];
};

const Spreadsheet = ({ savedWorkbook }: { savedWorkbook?: Workbook }) => {
  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: savedWorkbook ? false : true,
  });
  const [sheetsData, setSheetsData] = useState<TransientSheetData[]>(
    initializeSheetForSavedWorkbook(savedWorkbook)
  );
  const [workbookName, setWorkbookName] = useState<string>(
    savedWorkbook?.name || 'Untitled Workbook'
  );
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [isWorkbookBeingEdited, setIsWorkbookBeingEdited] = useState(false);
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(false);

  const router = useRouter();
  const { dsId, workbookId } = router.query;

  useEffect(() => {
    if (router.pathname.includes('edit')) setIsWorkbookBeingEdited(true);
  }, []);

  const getOperands = (newHeader: string) =>
    (newHeader.match(expressionTokenRegex) || []).filter((char: string) =>
      isOperand(char)
    );

  const getOperatorsIndex = (operands: string[]) =>
    operands.map((operand: string) => operand.toUpperCase().charCodeAt(0) - 65);

  const generateLookupTable = (operands: string[], operandsIndex: number[]) => {
    const lookupTable: { [key: string]: any[] } = {};
    operands.forEach((operand: string, index: number) => {
      if (isdigit(operand)) {
        lookupTable[operand] = new Array(
          sheetsData[selectedSheetIndex].data.length
        ).fill(parseFloat(operand));
      } else {
        const currentSheet = sheetsData[selectedSheetIndex];
        const header = currentSheet.headers[operandsIndex[index]];
        const valueList = currentSheet.data.map((item) => item[header.name]);
        lookupTable[operand] = valueList;
      }
    });

    return lookupTable;
  };

  const getPaddingHeadersLenth = (
    columnId: string,
    existingHeadersLength: number
  ) => {
    const toUpdateHeaderIndex = columnId.charCodeAt(0) - 65;

    const toAddPaddingHeadersLength =
      toUpdateHeaderIndex - existingHeadersLength;

    return toAddPaddingHeadersLength > 0 ? toAddPaddingHeadersLength : 0;
  };

  const updateSelectedSheetDataAndHeaders = (
    evaluatedData: any[],
    header: SpreadSheetColumn,
    columnId: string
  ) => {
    const tempSheetsData = cloneDeep(sheetsData);
    const existingHeaders = tempSheetsData[selectedSheetIndex]?.headers;
    const oldColumnId = columnId;

    const existingHeaderIndex = existingHeaders.findIndex(
      (header) => header.name === oldColumnId
    );

    const paddingHeadersLength = getPaddingHeadersLenth(
      columnId,
      existingHeaders.length
    );

    const paddedHeaders = Array.from({ length: paddingHeadersLength }).map(
      (_, index) => ({
        name: String.fromCharCode(65 + index + existingHeaders.length),
        type: ColumnType.PADDING_HEADER,
      })
    );

    if (existingHeaderIndex !== -1) {
      // update exisitng header and subheader
      // for updating subheaders, need to add 1 to maintain sheets 'index' column
      tempSheetsData[selectedSheetIndex].headers[existingHeaderIndex] = header;
      tempSheetsData[selectedSheetIndex].subHeaders[
        existingHeaderIndex + 1
      ].name = header.name;
    } else {
      // add new headers and subheaders
      const columnIndex = columnId.charCodeAt(0) - 65 + 1;
      tempSheetsData[selectedSheetIndex].headers = [
        ...existingHeaders,
        ...paddedHeaders,
        header,
      ];
      tempSheetsData[selectedSheetIndex].subHeaders[columnIndex].name =
        header.name;
    }

    // update sheet data with evaluated data
    tempSheetsData[selectedSheetIndex].data = tempSheetsData[
      selectedSheetIndex
    ].data.map((item, index) => ({
      ...item,
      [header.name]: evaluatedData[index] || '',
    }));

    setSheetsData(tempSheetsData);
  };

  const parseExpression = (prefixHeader: string) => {
    return prefixHeader.match(expressionTokenRegex) || [''];
  };

  const evaluateFormulaHeader = useCallback(
    (headerText: string, columnId: string) => {
      const newHeader = {
        name: headerText.replace(/\s/g, '').toUpperCase(),
        type: ColumnType.COMPUTED_HEADER,
      };
      const operands = getOperands(newHeader.name);
      const operandsIndex = getOperatorsIndex(operands);

      const parsedExpression: any[] = parseExpression(newHeader.name);
      const lookupTable = generateLookupTable(operands, operandsIndex);

      const evaluatedData = evaluateExpression(
        parsedExpression as string[],
        lookupTable
      );

      updateSelectedSheetDataAndHeaders(evaluatedData, newHeader, columnId);
    },
    [sheetsData, selectedSheetIndex]
  );

  const generateLookupTableFromQueriedData = (
    operands: string[],
    operandsIndex: number[],
    queriedData: any[],
    headers: SpreadSheetColumn[]
  ) => {
    const lookupTable: { [key: string]: any[] } = {};
    operands.forEach((operand: string, index: number) => {
      if (isdigit(operand)) {
        lookupTable[operand] = new Array(queriedData.length).fill(
          parseFloat(operand)
        );
      } else {
        const header = headers[operandsIndex[index]];
        const valueList = queriedData.map((item) => item[header.name]);
        lookupTable[operand] = valueList;
      }
    });

    return lookupTable;
  };

  const getUpdatedQueryData = (
    data: any[],
    header: SpreadSheetColumn,
    queriedData: any[]
  ) => {
    queriedData = queriedData.map((item: any, index: number) => ({
      ...item,
      [header.name]: data[index],
    }));
    return queriedData;
  };

  const evaluateDataOnQueriedData = (
    headerText: string,
    queriedData: any[],
    headers: SpreadSheetColumn[]
  ) => {
    const newHeader = {
      name: headerText,
      type: ColumnType.COMPUTED_HEADER,
    };

    const operands = getOperands(newHeader.name);
    const operandsIndex = getOperatorsIndex(operands);

    const parsedExpression: any[] = parseExpression(newHeader.name);

    const lookupTable = generateLookupTableFromQueriedData(
      operands,
      operandsIndex,
      queriedData,
      headers
    );

    const evaluatedData = evaluateExpression(
      parsedExpression as string[],
      lookupTable
    );

    return getUpdatedQueryData(evaluatedData, newHeader, queriedData);
  };

  const hasQueryWithoutData =
    savedWorkbook &&
    sheetsData[selectedSheetIndex].query &&
    !sheetsData[selectedSheetIndex].data.length;

  useEffect(() => {
    if (!savedWorkbook) return;

    const updateSheetData = (data: any[]) => {
      const toUpdateSheets = cloneDeep(sheetsData);
      toUpdateSheets[selectedSheetIndex].data = data;
      setSheetsData(toUpdateSheets);
    };

    const fetchData = async (selectedSheet: TransientSheetData) => {
      const res = await getTransientSpreadsheets(
        dsId as string,
        selectedSheet.query,
        selectedSheet.is_sql
      );
      let queriedData = res?.data?.data;

      const computedHeaders = selectedSheet.headers
        .map((header, index) => ({
          columnId: String.fromCharCode(65 + index),
          ...header,
        }))
        .filter((header) => header.type === ColumnType.COMPUTED_HEADER);

      computedHeaders.forEach((header) => {
        queriedData = evaluateDataOnQueriedData(
          header.name,
          queriedData,
          selectedSheet.headers
        );
      });

      updateSheetData(queriedData);
    };

    if (hasQueryWithoutData) {
      fetchData(sheetsData[selectedSheetIndex]);
    }
  }, [selectedSheetIndex]);

  const handleSaveOrUpdateFunnel = async () => {
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

  const addDimensionColumn = () => {
    const tempSheetsData = cloneDeep(sheetsData);
    const existingSubHeaders = tempSheetsData[selectedSheetIndex]?.subHeaders;

    const index = existingSubHeaders
      .map((h) => h.type)
      .lastIndexOf(SubHeaderColumnType.DIMENSION);

    tempSheetsData[selectedSheetIndex].subHeaders[index + 1].type =
      SubHeaderColumnType.DIMENSION;

    setSheetsData(tempSheetsData);
  };

  return (
    <>
      <QueryModal
        isOpen={isOpen}
        onClose={onClose}
        sheetData={sheetsData[selectedSheetIndex]}
        sheetsData={sheetsData}
        setSheetsData={setSheetsData}
        selectedSheetIndex={selectedSheetIndex}
      />
      {!isOpen && (
        <>
          <Box
            px={'5'}
            position={'sticky'}
            top={'0'}
            width={'full'}
            background={'white.400'}
            zIndex={'99'}
          >
            <EventLayoutHeader
              name={workbookName}
              setName={setWorkbookName}
              handleGoBack={() => router.back()}
              handleSave={handleSaveOrUpdateFunnel}
              isSaveButtonDisabled={isSaveButtonDisabled}
            />
            {sheetsData[selectedSheetIndex].query && (
              <Flex
                alignItems={'center'}
                justifyContent={'space-between'}
                p={'1'}
              >
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={400}
                  data-testid={'query-text'}
                ></Text>

                <Button
                  px={'2'}
                  h={'6'}
                  bg={'grey.400'}
                  variant={'secondary'}
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                  onClick={() => onOpen()}
                  data-testid={'edit-query-button'}
                >
                  Edit Query
                </Button>
              </Flex>
            )}
          </Box>
          {hasQueryWithoutData ? (
            <Flex
              h={'full'}
              w={'full'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <LoadingSpinner />
            </Flex>
          ) : (
            <>
              <Flex overflow={'scroll'} data-testid={'react-grid'}>
                <Grid
                  selectedSheetIndex={selectedSheetIndex}
                  sheetData={cloneDeep(sheetsData[selectedSheetIndex])}
                  evaluateFormulaHeader={evaluateFormulaHeader}
                  addDimensionColumn={addDimensionColumn}
                />
              </Flex>
              <Footer
                openQueryModal={onOpen}
                sheetsData={sheetsData}
                setSheetsData={setSheetsData}
                selectedSheetIndex={selectedSheetIndex}
                setSelectedSheetIndex={setSelectedSheetIndex}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Spreadsheet;
