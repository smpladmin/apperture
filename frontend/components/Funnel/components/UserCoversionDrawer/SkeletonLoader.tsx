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

const SkeletonLoadeProps = () => {
  return (
    <Flex w={'full'} maxH={'full'}>
      <Tabs w={'full'} display={'flex'} flexDirection={'column'}>
        <TabList>
          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
          >
            <Skeleton>Converted</Skeleton>
          </Tab>

          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
          >
            <Skeleton>Dropped</Skeleton>
          </Tab>
        </TabList>

        <TabPanels display={'flex'} maxH={'full'} flex={1} overflow={'hidden'}>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            <Flex flexDirection="column" maxH={'full'} w={'full'} grow={1}>
              <Flex justifyContent={'space-between'} py={4} maxH={'full'}>
                <Skeleton
                  flex={1}
                  fontSize={14}
                  lineHeight={'18px'}
                  color={'grey.100'}
                  fontWeight={500}
                ></Skeleton>
              </Flex>
              <Box
                overflowY={'auto'}
                border={'0.4px solid #b2b2b5'}
                borderRadius={'8px'}
                maxH={'full'}
              >
                <TableSkeleton tableHeader={['', '']} />
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default SkeletonLoadeProps;
