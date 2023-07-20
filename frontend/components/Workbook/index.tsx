import React, { useCallback, useEffect, useState } from 'react';
import WorkbookHeader from './components/Header';
import {
  getTransientSpreadsheets,
  getWorkbookTransientColumn,
  saveWorkbook,
  updateWorkbook,
} from '@lib/services/workbookService';
import { useRouter } from 'next/router';
import {
  ColumnType,
  SheetType,
  SpreadSheetColumn,
  SubHeaderColumnType,
  TransientColumnRequestState,
  TransientSheetData,
  Workbook,
} from '@lib/domain/workbook';
import { Box, Flex, useDisclosure, useToast } from '@chakra-ui/react';
import SidePanel from './components/SidePanel';
import Grid from '@components/Spreadsheet/components/Grid/Grid';
import Footer from '@components/Workbook/components/Footer';
import QueryEditor from './components/QueryEditor';
import SelectSheet from './components/SelectSheet';
import EmptySheet from './components/EmptySheet';
import { getConnectionsForApp } from '@lib/services/connectionService';
import { cloneDeep } from 'lodash';
import {
  evaluateExpression,
  expressionTokenRegex,
  isOperand,
  isdigit,
} from './util';
import { DimensionParser, Metricparser } from '@lib/utils/parser';
import { Connection } from '@lib/domain/connections';

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
      edit_mode: sheet?.edit_mode || true,
      sheet_type: SheetType.SIMPLE_SHEET,
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
      sheet_type: SheetType.SIMPLE_SHEET,
      edit_mode: false,
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
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showColumns, setShowColumns] = useState(false);

  const [requestTranisentColumn, setRequestTransientColumn] =
    useState<TransientColumnRequestState>({
      isLoading: false,
      subheaders: [],
    });
  const toast = useToast();

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

  useEffect(() => {
    const fetchConnections = async () => {
      const res = await getConnectionsForApp(dsId as string);
      setConnections(res);
    };
    fetchConnections();
  }, [dsId]);

  useEffect(() => {
    const sheet = sheetsData[selectedSheetIndex];

    if (sheet?.query) setShowEmptyState(false);
    if (!sheet?.query || sheet.edit_mode) return;
    const abortController = new AbortController();

    const { signal } = abortController;

    const fetchTransientSheetData = async () => {
      const response = await getTransientSpreadsheets(
        dsId as string,
        sheet.query,
        sheet?.is_sql,
        signal
      );

      if (response.status === 200) {
        const toUpdateSheets = cloneDeep(sheetsData);
        toUpdateSheets[selectedSheetIndex].data = response?.data?.data;
        toUpdateSheets[selectedSheetIndex].headers = response?.data?.headers;
        setSheetsData(toUpdateSheets);
      }
    };

    fetchTransientSheetData();
    return () => abortController.abort();
  }, [sheetsData[selectedSheetIndex]?.query]);

  const handleSaveOrUpdateWorkbook = async () => {
    const sheets = sheetsData.map((sheet) => {
      return {
        name: sheet.name,
        is_sql: sheet.is_sql,
        headers: sheet.headers,
        query: sheet.query,
        subHeaders: sheet.subHeaders,
        edit_mode: sheet.edit_mode,
        meta: sheet.meta,
        sheet_type: sheet.sheet_type,
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

  const arrangeTransientColumnHeader = (
    subheaders: {
      name: string;
      type: SubHeaderColumnType;
    }[],
    originalHeader: SpreadSheetColumn[]
  ) => {
    const { min, max } = subheaders.reduce(
      (
        val: { min: number; max: number },
        subheader: {
          name: string;
          type: SubHeaderColumnType;
        },
        index: number
      ) => {
        if (subheader.name) {
          val.min = val.min > index ? index : val.min;
          val.max = val.max < index ? index : val.max;
        }
        return val;
      },
      { min: subheaders.length + 1, max: -1 }
    );
    const newHeader: SpreadSheetColumn[] = [];
    let i = 0;
    subheaders.slice(min, max + 1).forEach((subheader) => {
      if (subheader.name) {
        newHeader.push(originalHeader[i]);
        i++;
      } else {
        newHeader.push({ name: '', type: ColumnType.PADDING_HEADER });
      }
    });
    return newHeader;
  };

  useEffect(() => {
    if (requestTranisentColumn.isLoading) {
      const fetchSheetData = async () => {
        const { subheaders } = requestTranisentColumn;
        const metrics = subheaders.filter(
          (subheader) =>
            subheader.name && subheader.type === SubHeaderColumnType.METRIC
        );
        const dimensions = subheaders.filter(
          (subheader) =>
            subheader.name && subheader.type === SubHeaderColumnType.DIMENSION
        );

        const database = 'default',
          table = 'events';

        const response = await getWorkbookTransientColumn(
          dsId as string,
          dimensions.map((dimension) => DimensionParser.parse(dimension.name)),
          metrics.map((metric) => Metricparser.parse(metric.name)),
          database,
          table
        );
        const newHeader = arrangeTransientColumnHeader(
          subheaders,
          response.data.headers
        );
        const tempSheetsData = cloneDeep(sheetsData);
        tempSheetsData[selectedSheetIndex].headers = newHeader;
        tempSheetsData[selectedSheetIndex].data = response.data.data;
        tempSheetsData[selectedSheetIndex].subHeaders = subheaders;
        setSheetsData(tempSheetsData);
      };
      fetchSheetData();
    }
  }, [requestTranisentColumn]);

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
      const sheetData = sheetsData[selectedSheetIndex];
      const isBlankSheet = !sheetData.is_sql && !sheetData.query;
      const index = columnId.toUpperCase().charCodeAt(0) - 64;
      if (headerText.match(/count|unique/i)) {
        if (isBlankSheet)
          try {
            if (
              sheetData.subHeaders[index].type === SubHeaderColumnType.DIMENSION
            ) {
              DimensionParser.parse(headerText);
            } else {
              Metricparser.parse(headerText);
            }
            sheetData.subHeaders[index].name = headerText;

            setRequestTransientColumn({
              isLoading: true,
              subheaders: sheetData.subHeaders,
            });
          } catch (error) {
            toast({
              title: `Invalid function syntax`,
              status: 'error',
              variant: 'subtle',
              isClosable: true,
            });
          }
      } else {
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
      }
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
    sheetsData[selectedSheetIndex]?.query &&
    !sheetsData[selectedSheetIndex]?.data?.length;

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

  const addDimensionColumn = (columnId: string) => {
    const tempSheetsData = cloneDeep(sheetsData);
    const index = columnId.charCodeAt(0) - 65 + 1;

    /**
     * 1. Remove last subheader, keeping them constant to 27 for now.
     * 2. Add subheader on the given columnId/index.
     * 3. TODO: Shift columns and data.
     */
    tempSheetsData[selectedSheetIndex].subHeaders.splice(-1);
    tempSheetsData[selectedSheetIndex].subHeaders.splice(index, 0, {
      name: '',
      type: SubHeaderColumnType.DIMENSION,
    });

    tempSheetsData[selectedSheetIndex].subHeaders[index + 1].type =
      SubHeaderColumnType.DIMENSION;

    setSheetsData(tempSheetsData);
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

        <Box h={'full'} w={'full'} overflowY={'auto'}>
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
            <Box overflow={'auto'} h={'full'}>
              <Grid
                sheetData={sheetsData[selectedSheetIndex]}
                selectedSheetIndex={selectedSheetIndex}
                evaluateFormulaHeader={evaluateFormulaHeader}
                addDimensionColumn={addDimensionColumn}
              />
            </Box>
          )}
          <Footer
            openSelectSheetOverlay={openSelectSheetOverlay}
            selectedSheetIndex={selectedSheetIndex}
            setSelectedSheetIndex={setSelectedSheetIndex}
            setSheetsData={setSheetsData}
            sheetsData={sheetsData}
            setShowColumns={setShowColumns}
            setShowEditor={setShowSqlEditor}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Workbook;
