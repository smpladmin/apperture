import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const ViewPanel = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      w={'full'}
      py={'4'}
      px={{ base: '4', md: '8' }}
      overflowY={{ md: 'auto' }}
      position="static"
    >
      {children}
    </Box>
  );
};

export default ViewPanel;
