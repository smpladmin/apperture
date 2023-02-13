import { Box, Text } from '@chakra-ui/react';
import React from 'react';

const ElipsisCell = ({ value }: { value: string }) => {
  return (
    <Box maxWidth={'55'}>
      <Text fontSize={'xs-14'} lineHeight={'base'} fontWeight={'400'}>
        {value}
      </Text>
    </Box>
  );
};

export default ElipsisCell;
