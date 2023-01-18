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
  setSelectedUser: Function;
};

const UserTableView = ({
  converted,
  dropped,
  setSelectedUser,
}: UserTableViewProps) => {
  const handleRowClick = (user: string) => {
    setSelectedUser(user);
  };
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
            Dropped
          </Tab>
        </TabList>

        <TabPanels display={'flex'} maxH={'full'} flex={1} overflow={'hidden'}>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            <UserListTable
              handleRowClick={handleRowClick}
              users={converted.users}
              unique_users={converted.unique_users}
              total_users={converted.total_users}
            />
          </TabPanel>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            <UserListTable
              handleRowClick={handleRowClick}
              users={dropped.users}
              unique_users={dropped.unique_users}
              total_users={dropped.total_users}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default UserTableView;
