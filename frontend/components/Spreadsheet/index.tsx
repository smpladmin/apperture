import React, { useState } from 'react';
import Grid from './components/Grid/Grid';
import QueryModal from './components/QueryModal';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import { TransientSheetData } from '@lib/domain/spreadsheet';
import Footer from './components/Footer';
import { evaluatePrefix, infixToPrefix, isOperand } from './util';

const Spreadsheet = () => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [sheetsData, setSheetsData] = useState<TransientSheetData[]>([
    {
      name: 'Sheet 1',
      query: 'Select user_id, event_name from events',
      data: [],
      headers: [],
    },
  ]);
  const [workbookName, setWorkbookName] = useState<string>('Untitled Workbook');
  const router = useRouter();
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  const parseFormulaHeader = (changedValue: any) => {
    const header = changedValue?.newCell?.text;
    console.log(header.split(''));
    const prefixHeader = infixToPrefix(header);
    const operands = header.split('').filter((char: string) => isOperand(char));
    const operandsIndex = operands.map(
      (operand: string) => operand.toUpperCase().charCodeAt(0) - 64
    );

    console.log({ operands, operandsIndex, prefixHeader });
    // evaluatePrefix(prefixHeader, {});
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
              sheetData={sheetsData[selectedSheetIndex]}
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
