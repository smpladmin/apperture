import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const ActionPanel = ({ children }: { children: ReactNode }) => {
  return (
    <Box width={{ base: 'full', md: '35%' }} minWidth={'82'} py={'5'}>
      {children}
    </Box>
  );
};

export default ActionPanel;
