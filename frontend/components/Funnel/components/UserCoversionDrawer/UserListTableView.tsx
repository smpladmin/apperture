import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
} from '@chakra-ui/react';
import { FunnelConversionData } from '@lib/domain/funnel';
import React from 'react';
import UserListTable from './UserListTable';

type UserTableViewProps = {
  converted: FunnelConversionData;
  dropped: FunnelConversionData;
};

const UserTableView = ({ converted, dropped }: UserTableViewProps) => {
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
            <Text>Converted</Text>
          </Tab>

          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
          >
            <Text>Dropped</Text>
          </Tab>
        </TabList>

        <TabPanels display={'flex'} maxH={'full'} flex={1} overflow={'hidden'}>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            <UserListTable {...converted} />
          </TabPanel>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            <UserListTable {...dropped} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default UserTableView;
