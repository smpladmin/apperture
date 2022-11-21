import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const RightPanel = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      w={'full'}
      py={'4'}
      px={{ base: '4', md: '8' }}
      overflowY={{ md: 'auto' }}
    >
      {children}
    </Box>
  );
};

export default RightPanel;
