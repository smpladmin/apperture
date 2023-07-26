import {
  Box,
  Button,
  Flex,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import LoadingSpinner from '@components/LoadingSpinner';
import {
  ColumnType,
  SpreadSheetColumn,
  SubHeaderColumn,
  SubHeaderColumnType,
  TransientColumnRequestState,
  TransientSheetData,
  Workbook,
} from '@lib/domain/workbook';
import {
  getTransientSpreadsheets,
  getWorkbookTransientColumn,
  saveWorkbook,
  updateWorkbook,
} from '@lib/services/workbookService';
import { DimensionParser, Metricparser } from '@lib/utils/parser';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import Grid from './components/Grid/Grid';
import QueryModal from './components/QueryModal';
import {
  evaluateExpression,
  expressionTokenRegex,
  isOperand,
  isdigit,
} from './util';
import { getEventProperties } from '@lib/services/datasourceService';

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
            index === 1 || index === 2
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
  const [requestTranisentColumn, setRequestTransientColumn] =
    useState<TransientColumnRequestState>({
      isLoading: Boolean(
        savedWorkbook?.spreadsheets[selectedSheetIndex]?.subHeaders.some(
          (subheader) => typeof subheader === 'string' && subheader?.[0] === '='
        )
      ),
      subheaders:
        savedWorkbook?.spreadsheets[selectedSheetIndex]?.subHeaders || [],
    });

  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const router = useRouter();
  const { dsId, workbookId } = router.query;

  const toast = useToast();

  const [isWorkbookBeingEdited, setIsWorkbookBeingEdited] = useState(false);
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [loadBODMASColumn, setloadBODMASColumn] = useState<{
    loading: boolean;
    data: TransientSheetData | null;
  }>({
    loading: false,
    data: null,
  });

  useEffect(() => {
    if (router.pathname.includes('edit')) setIsWorkbookBeingEdited(true);
    const fetchProperties = async () => {
      const properties: string[] = await getEventProperties(dsId as string);
      setEventProperties([
        'event_name',
        'user_id',
        'timestamp',
        ...properties.map((property) => `properties.${property}`),
      ]);
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (requestTranisentColumn.isLoading) {
      const { subheaders } = requestTranisentColumn;

      fetchSheetData(subheaders);
    }
  }, [requestTranisentColumn]);

  const updateSheetData = (data: any[]) => {
    const toUpdateSheets = cloneDeep(sheetsData);
    toUpdateSheets[selectedSheetIndex].data = data;
    setSheetsData(toUpdateSheets);
  };
  useEffect(() => {
    if (!savedWorkbook) return;
    const hasColumnFetcSubheaderWithoutData =
      savedWorkbook &&
      Boolean(
        savedWorkbook?.spreadsheets[selectedSheetIndex]?.subHeaders.some(
          (subheader) =>
            typeof subheader.name === 'string' &&
            subheader.name.match(/^[unique|count]/)
        )
      ) &&
      !sheetsData[selectedSheetIndex].data.length;
    if (hasColumnFetcSubheaderWithoutData) {
      const { subHeaders, headers } =
        savedWorkbook?.spreadsheets[selectedSheetIndex];
      fetchSheetData(subHeaders);
    }

    const fetchData = async (selectedSheet: TransientSheetData) => {
      const res = await getTransientSpreadsheets(
        dsId as string,
        selectedSheet.query,
        selectedSheet?.is_sql as boolean
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

  useEffect(() => {
    const { data, loading } = loadBODMASColumn;
    if (!loading) return;
    if (data) {
      let queriedData = data?.data;
      data?.subHeaders
        .filter(
          (subheader) =>
            subheader.name && !subheader.name.match(/^unique|count/)
        )
        .forEach((expression) => {
          queriedData = evaluateDataOnQueriedData(
            expression?.name,
            queriedData,
            data?.headers
          );
        });
      updateSheetData(queriedData);

      setloadBODMASColumn({ loading: false, data: null });
    }
  }, [loadBODMASColumn]);

  const arrangeTransientColumnHeader = (
    subheaders: SubHeaderColumn[],
    originalHeader: SpreadSheetColumn[]
  ) => {
    const max = subheaders.reduce(
      (max: number, subheader: SubHeaderColumn, index: number) => {
        if (subheader.name) {
          max = max < index ? index : max;
        }
        return max;
      },
      -1
    );
    const newHeaders: SpreadSheetColumn[] = [];
    let i = 0;
    subheaders.slice(1, max + 1).forEach((subheader, index) => {
      if (subheader.name && subheader.name.match(/^[unique|count]/)) {
        newHeaders.push(originalHeader[i]);
        i++;
        while (originalHeader[i]?.type === ColumnType.PADDING_HEADER) {
          i++;
        }
      } else if (subheader.name) {
        newHeaders.push({
          name: subheader.name,
          type: ColumnType.COMPUTED_HEADER,
        });
      } else {
        newHeaders.push({
          name: String.fromCharCode(65 + index),
          type: ColumnType.PADDING_HEADER,
        });
      }
    });
    return newHeaders;
  };
  const fetchSheetData = async (subheaders: SubHeaderColumn[]) => {
    const metrics = subheaders.filter(
      (subheader) =>
        subheader.name.match(/^[unique|count]/) &&
        subheader.type === SubHeaderColumnType.METRIC
    );
    const dimensions = subheaders.filter(
      (subheader) =>
        subheader.name && subheader.type === SubHeaderColumnType.DIMENSION
    );

    const database = 'default',
      table = 'events';

    const response = await getWorkbookTransientColumn(
      dsId as string,
      dimensions.map((dimension) => DimensionParser().parse(dimension.name)),
      metrics.map((metric) => Metricparser().parse(metric.name)),
      database,
      table
    );
    if (response.status !== 200) {
      toast({
        title: 'Something went wrong!',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
    } else {
      const newHeaders = arrangeTransientColumnHeader(
        subheaders,
        response.data.headers
      );

      const tempSheetsData = cloneDeep(sheetsData);
      tempSheetsData[selectedSheetIndex].headers = newHeaders;
      tempSheetsData[selectedSheetIndex].data = response.data.data;
      tempSheetsData[selectedSheetIndex].subHeaders = subheaders;
      setSheetsData(tempSheetsData);
      setloadBODMASColumn({
        loading: true,
        data: tempSheetsData[selectedSheetIndex],
      });
    }
  };

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

  const getHeaderIndex = (sheetData: TransientSheetData, columnId: string) => {
    const existingHeaders = sheetData?.headers;

    const existingHeaderIndex = existingHeaders.findIndex(
      (header) => header.name === columnId
    );

    if (existingHeaderIndex !== -1) {
      // add 1 as offset for index header
      return existingHeaderIndex + 1;
    } else {
      return columnId.toUpperCase().charCodeAt(0) - 65 + 1;
    }
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
      const index = getHeaderIndex(sheetData, columnId);

      if (headerText.match(/^[unique|count]/)) {
        if (isBlankSheet)
          try {
            if (
              sheetData.subHeaders[index].type === SubHeaderColumnType.DIMENSION
            ) {
              DimensionParser().parse(headerText);
            } else {
              Metricparser().parse(headerText);
            }

            const tempSheetsData = cloneDeep(sheetsData);
            tempSheetsData[selectedSheetIndex].subHeaders[index].name =
              headerText;
            setSheetsData(tempSheetsData);

            setRequestTransientColumn({
              isLoading: true,
              subheaders: tempSheetsData[selectedSheetIndex].subHeaders,
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
    sheetsData[selectedSheetIndex].query &&
    !sheetsData[selectedSheetIndex].data.length;

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
                  properties={eventProperties}
                />
              </Flex>
              {/* <Footer
                // openQueryModal={onOpen}
                sheetsData={sheetsData}
                setSheetsData={setSheetsData}
                selectedSheetIndex={selectedSheetIndex}
                setSelectedSheetIndex={setSelectedSheetIndex}
              /> */}
            </>
          )}
        </>
      )}
    </>
  );
};

export default Spreadsheet;
