import React from 'react';
import { BaseCellProps } from './Grid';
import { Box, Input } from '@chakra-ui/react';

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
