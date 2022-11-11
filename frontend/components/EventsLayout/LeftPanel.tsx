import { Box } from '@chakra-ui/react';
import { BLACK_RUSSIAN } from '@theme/index';
import React, { ReactNode } from 'react';

const LeftPanel = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      width={'40%'}
      minWidth={'82'}
      bg={BLACK_RUSSIAN}
      overflowY={'auto'}
      py={'6'}
      px={'6'}
    >
      {children}
    </Box>
  );
};

export default LeftPanel;
