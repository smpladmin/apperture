import React, { useState } from 'react';
import Grid from './components/Grid';
import QueryModal from './components/QueryModal';
import { Box, Flex } from '@chakra-ui/react';
import EventLayoutHeader from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';

const Spreadsheet = () => {
  const [sheetData, setSheetData] = useState({ data: [], headers: [] });
  const [workbookName, setWorkbookName] = useState<string>('Untitled Workbook');
  const router = useRouter();
  return (
    <>
      <QueryModal setSheetData={setSheetData} />

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
  );
};

export default Spreadsheet;
