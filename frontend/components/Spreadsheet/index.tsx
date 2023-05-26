import React, { useEffect, useState } from 'react';
import Grid from './components/Grid';
import QueryModal from './components/QueryModal';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import { TransientSheetData } from '@lib/domain/spreadsheet';

const Spreadsheet = () => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [sheetData, setSheetData] = useState<TransientSheetData>({
    data: [],
    headers: [],
  });
  const [workbookName, setWorkbookName] = useState<string>('Untitled Workbook');
  const router = useRouter();

  return (
    <>
      <QueryModal
        isOpen={isOpen}
        onClose={onClose}
        setSheetData={setSheetData}
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
          <Flex overflow={'scroll'}>
            <Grid sheetData={sheetData} />
          </Flex>
        </>
      )}
    </>
  );
};

export default Spreadsheet;
