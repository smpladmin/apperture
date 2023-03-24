import { Box } from '@chakra-ui/react';
import { BLACK_RUSSIAN } from '@theme/index';
import React, { ReactNode } from 'react';

const ActionPanel = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      width={{ base: 'full', md: '35%' }}
      minWidth={'82'}
      // bg={BLACK_RUSSIAN}
      overflowY={{ md: 'auto' }}
      py={'5'}
    >
      {children}
    </Box>
  );
};

export default ActionPanel;
