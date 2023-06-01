import React, { useEffect, useState } from 'react';
import Grid from './components/Grid/Grid';
import QueryModal from './components/QueryModal';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import { TransientSheetData } from '@lib/domain/spreadsheet';
import Footer from './components/Footer';
import { evaluatePrefix, infixToPrefix, isOperand, isdigit } from './util';
import cloneDeep from 'lodash/cloneDeep';
import { clone } from 'lodash';

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

  const parseFormulaHeader = (changedValue: any) => {
    const header = changedValue?.newCell?.text.replace(/\s/g, '');
    const prefixHeader = infixToPrefix(header);
    const operands = header.split('').filter((char: string) => isOperand(char));
    const operandsIndex = operands.map(
      (operand: string) => operand.toUpperCase().charCodeAt(0) - 65
    );

    const lookup_table: { [key: string]: any[] } = {};

    operands.forEach((operand: string, index: number) => {
      if (isdigit(operand)) {
        lookup_table[operand] = new Array(
          sheetsData[selectedSheetIndex].data.length
        ).fill(parseFloat(operand));
      } else {
        const currentSheet = sheetsData[selectedSheetIndex];
        const header = currentSheet.headers[operandsIndex[index]];
        const valueList = currentSheet.data.map((item) => item[header]);
        lookup_table[operand] = valueList;
        // debugger;
      }
    });
    const result = evaluatePrefix(prefixHeader, lookup_table);

    const tempSheetsData = cloneDeep(sheetsData);
    tempSheetsData[selectedSheetIndex].data = tempSheetsData[
      selectedSheetIndex
    ].data.map((item, index) => ({
      ...item,
      [header]: result[index],
    }));
    tempSheetsData[selectedSheetIndex].headers = [
      ...tempSheetsData[selectedSheetIndex].headers,
      header,
    ];

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
              handleSave={() => {}}
              isSaveButtonDisabled={true}
            />
          </Box>
          <Flex overflow={'scroll'} data-testid={'react-grid'}>
            <Grid
              sheetData={cloneDeep(sheetsData[selectedSheetIndex])}
              parseFormulaHeader={parseFormulaHeader}
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
