import React from 'react';
import { Box, Input } from '@chakra-ui/react';
import { BaseCellProps } from './gridTypes';

const CustomCell = (props: BaseCellProps) => {
  return (
    <Box w={'100%'}>
      <Input
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        defaultValue={props.value}
      />
    </Box>
  );
};

export default CustomCell;
