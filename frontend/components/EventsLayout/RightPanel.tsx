import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const RightPanel = ({ children }: { children: ReactNode }) => {
  return <Box w={'full'}>{children}</Box>;
};

export default RightPanel;
