import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Skeleton,
  Box,
} from '@chakra-ui/react';
import TableSkeleton from '@components/Skeleton/TableSkeleton';
import { FunnelConversionData } from '@lib/domain/funnel';
import React from 'react';
import UserListTable from './UserListTable';

const SkeletonLoader = () => {
  return (
    <Flex flexDirection="column" maxH={'full'} w={'full'} grow={1}>
      <Box
        overflowY={'auto'}
        border={'0.4px solid #b2b2b5'}
        borderRadius={'8px'}
        maxH={'full'}
        margin={6}
      >
        <TableSkeleton tableHeader={['', '']} />
      </Box>
    </Flex>
  );
};

export default SkeletonLoader;
