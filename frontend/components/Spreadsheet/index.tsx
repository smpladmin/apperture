import React, { useCallback, useState } from 'react';
import Grid from './components/Grid/Grid';
import QueryModal from './components/QueryModal';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import {
  ColumnType,
  SpreadSheetColumn,
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
import { CellChange } from '@silevis/reactgrid';
import { saveWorkbook } from '@lib/services/workbookService';

const Spreadsheet = ({ savedWorkbook }: { savedWorkbook?: Workbook }) => {
  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: savedWorkbook ? false : true,
  });
  const [sheetsData, setSheetsData] = useState<TransientSheetData[]>([
    {
      name: 'Sheet 1',
      query: 'Select user_id, event_name from events',
      data: [],
      headers: [],
      is_sql: true,
    },
  ]);

  const [workbookName, setWorkbookName] = useState<string>(
    savedWorkbook?.name || 'Untitled Workbook'
  );
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  const router = useRouter();
  const { dsId } = router.query;

  const handleSave = async () => {
    const sheets = sheetsData.map((sheet) => {
      return {
        name: sheet.name,
        is_sql: sheet.is_sql,
        headers: sheet.headers,
        query: sheet.query,
      };
    });

    const res = await saveWorkbook(dsId as string, workbookName, sheets);

    if (res.status === 200)
      router.push({
        pathname: `/analytics/workbook/list/[dsId]`,
        query: { dsId },
      });
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

  const updateSelectedSheetDataAndHeaders = (
    data: any[],
    header: SpreadSheetColumn,
    columnId: string
  ) => {
    const tempSheetsData = cloneDeep(sheetsData);
    const headerPadding =
      columnId.charCodeAt(0) -
      65 -
      tempSheetsData[selectedSheetIndex].headers.length;

    const padding = new Array(headerPadding).fill('');

    tempSheetsData[selectedSheetIndex].data = tempSheetsData[
      selectedSheetIndex
    ].data.map((item, index) => ({
      ...item,
      [header.name]: data[index],
      '': '',
    }));
    tempSheetsData[selectedSheetIndex].headers = [
      ...tempSheetsData[selectedSheetIndex].headers,
      ...padding,
      header,
    ];
    setSheetsData(tempSheetsData);
  };

  const parseExpression = (prefixHeader: string) => {
    return prefixHeader.match(expressionTokenRegex) || [''];
  };

  const evaluateFormulaHeader = useCallback(
    (changedValue: CellChange<any>) => {
      const newHeader = {
        name: changedValue?.newCell?.text.replace(/\s/g, '').toUpperCase(),
        type: ColumnType.COMPUTED_HEADER,
      };
      const columnId = changedValue?.columnId;

      const operands = getOperands(newHeader.name);
      const operandsIndex = getOperatorsIndex(operands);

      const parsedExpression: any[] = parseExpression(newHeader.name);

      const lookupTable = generateLookupTable(operands, operandsIndex);
      const evaluatedData = evaluateExpression(
        parsedExpression as string[],
        lookupTable
      );

      updateSelectedSheetDataAndHeaders(
        evaluatedData,
        newHeader,
        columnId as string
      );
    },
    [sheetsData]
  );

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
              handleSave={handleSave}
              isSaveButtonDisabled={false}
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
                >
                  {/* {sheetsData[selectedSheetIndex].query.length < 100
                    ? sheetsData[selectedSheetIndex].query
                    : sheetsData[selectedSheetIndex].query.slice(0, 100) +
                      '...'} */}
                </Text>

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
          <Flex overflow={'scroll'} data-testid={'react-grid'}>
            <Grid
              sheetData={cloneDeep(sheetsData[selectedSheetIndex])}
              evaluateFormulaHeader={evaluateFormulaHeader}
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
  );
};

export default Spreadsheet;
