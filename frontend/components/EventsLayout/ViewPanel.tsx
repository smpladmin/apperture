import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const ViewPanel = ({ children }: { children: ReactNode }) => {
  return (
    <Box w={'full'} p={5} overflowY={{ md: 'auto' }}>
      {children}
    </Box>
  );
};

export default ViewPanel;
