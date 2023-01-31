import {
  Flex,
  Box,
} from '@chakra-ui/react';
import TableSkeleton from '@components/Skeleton/TableSkeleton';
import React from 'react';

const SkeletonLoader = () => {
  return (
    <Flex flexDirection="column" maxH={'full'} w={'full'} grow={1}>
      <Box
        overflowY={'auto'}
        border={'0.4px solid #b2b2b5'}
        borderRadius={'8px'}
        maxH={'full'}
      >
        <TableSkeleton tableHeader={['', '']} />
      </Box>
    </Flex>
  );
};

export default SkeletonLoader;
