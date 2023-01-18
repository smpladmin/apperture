import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
} from '@chakra-ui/react';
import {  UserProperty } from '@lib/domain/funnel';
import React from 'react';
import UserPropertyTable from './UserPropertyTable';

type UserPropertyViewProps = {
  properties: UserProperty[];
};

const UserPropertyView = ({ properties }: UserPropertyViewProps) => {
  return (
    <Flex w={'full'} maxH={'full'} flexDirection={'column'}>
      <Tabs w={'full'} display={'flex'} flexDirection={'column'}>
        <TabList>
          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
          >
            <Text>Properties</Text>
          </Tab>
          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
          >
            <Text>Activity</Text>
          </Tab>
        </TabList>

        <TabPanels display={'flex'} maxH={'full'} flex={1} overflow={'hidden'}>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            <UserPropertyTable properties={properties} />
          </TabPanel>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            No activities
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default UserPropertyView;
