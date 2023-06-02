import React, { useCallback, useState } from 'react';
import Grid from './components/Grid/Grid';
import QueryModal from './components/QueryModal';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import { TransientSheetData } from '@lib/domain/spreadsheet';
import Footer from './components/Footer';
import { evaluatePrefix, infixToPrefix, isOperand, isdigit } from './util';
import cloneDeep from 'lodash/cloneDeep';
import { CellChange } from '@silevis/reactgrid';

const Spreadsheet = () => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [sheetsData, setSheetsData] = useState<TransientSheetData[]>([
    {
      name: 'Sheet 1',
      query:
        'SELECT event_name, COUNT(event_name) FROM events GROUP BY event_name',
      data: [],
      headers: [],
    },
  ]);
  const [workbookName, setWorkbookName] = useState<string>('Untitled Workbook');
  const router = useRouter();
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  const getOperands = (newHeader: string) =>
    newHeader.split('').filter((char: string) => isOperand(char));

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
        const valueList = currentSheet.data.map((item) => item[header]);
        lookupTable[operand] = valueList;
      }
    });

    return lookupTable;
  };

  const updateSelectedSheetDataAndHeaders = (data: any[], header: string) => {
    const tempSheetsData = cloneDeep(sheetsData);
    tempSheetsData[selectedSheetIndex].data = tempSheetsData[
      selectedSheetIndex
    ].data.map((item, index) => ({
      ...item,
      [header]: data[index],
    }));
    tempSheetsData[selectedSheetIndex].headers = [
      ...tempSheetsData[selectedSheetIndex].headers,
      header,
    ];
    setSheetsData(tempSheetsData);
  };

  const evaluateFormulaHeader = useCallback(
    (changedValue: CellChange<any>) => {
      const newHeader = changedValue?.newCell?.text.replace(/\s/g, '');
      const prefixHeader = infixToPrefix(newHeader);

      const operands = getOperands(newHeader);
      const operandsIndex = getOperatorsIndex(operands);

      const lookupTable = generateLookupTable(operands, operandsIndex);
      const evaluatedData = evaluatePrefix(prefixHeader, lookupTable);

      updateSelectedSheetDataAndHeaders(evaluatedData, newHeader);
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
              handleSave={() => {}}
              isSaveButtonDisabled={true}
            />
            {sheetsData[selectedSheetIndex].query && (
              <Flex
                alignItems={'center'}
                justifyContent={'space-between'}
                p={'1'}
              >
                <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={400}>
                  {sheetsData[selectedSheetIndex].query}
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
