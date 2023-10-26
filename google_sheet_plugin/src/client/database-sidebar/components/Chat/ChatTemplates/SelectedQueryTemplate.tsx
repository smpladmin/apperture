import React from 'react';
import ChatTemplate from './ChatTemplate';
import { Box, Text } from '@chakra-ui/react';
import { WorkbookWithSheet } from '../../../lib/types';

const SelectedQueryTemplate = ({
  workbook,
  timestamp,
}: {
  workbook: WorkbookWithSheet;
  timestamp: string;
}) => {
  return (
    <ChatTemplate sender="apperture" timestamp={timestamp}>
      <Text
        fontSize={'12px'}
        fontWeight={'400'}
        lineHeight={'16px'}
      >{`You just ran ${workbook?.name}, ${workbook?.sheet?.name}: `}</Text>
      <Box px={'8px'} py={'12px'} bg={'#F5F5F5'} mt={'8px'}>
        <Text fontSize={'10px'} fontWeight={'400'} lineHeight={'14px'}>
          {workbook?.sheet?.query}
        </Text>
      </Box>
    </ChatTemplate>
  );
};

export default SelectedQueryTemplate;
