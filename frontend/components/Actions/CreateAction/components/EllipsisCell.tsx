import { Box, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const ElipsisCell = ({ children }: { children: ReactNode }) => {
  return (
    <Box maxWidth={'55'}>
      <Text fontSize={'xs-14'} lineHeight={'base'} fontWeight={'400'}>
        {children}
      </Text>
    </Box>
  );
};

export default ElipsisCell;
