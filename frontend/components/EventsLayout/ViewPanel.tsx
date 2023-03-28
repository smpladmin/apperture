import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const ViewPanel = ({ children }: { children: ReactNode }) => {
  return (
    <Box w={'full'} overflowY={{ md: 'auto' }} py={'5'}>
      {children}
    </Box>
  );
};

export default ViewPanel;
