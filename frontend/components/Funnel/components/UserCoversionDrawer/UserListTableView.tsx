import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
} from '@chakra-ui/react';
import {
  ConversionStatus,
  FunnelConversionData,
  FunnelStep,
} from '@lib/domain/funnel';
import { getConversionData } from '@lib/services/funnelService';
import React, { useEffect, useState } from 'react';
import SkeletonLoader from './SkeletonLoader';
import UserListTable from './UserListTable';

type UserTableViewProps = {
  setSelectedUser: Function;
  dsId: string;
  steps: FunnelStep[];
};
type FunnelEventConversion = {
  converted?: FunnelConversionData;
  dropped?: FunnelConversionData;
};

const UserTableView = ({
  dsId,
  steps,
  setSelectedUser,
}: UserTableViewProps) => {
  const [userData, setUserData] = useState<FunnelEventConversion>();
  const [status, setStatus] = useState<ConversionStatus>(
    ConversionStatus.CONVERTED
  );
  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getConversionData(dsId, steps, status);
      if (status === ConversionStatus.DROPPED) {
        setUserData({ ...userData, dropped: data });
      } else {
        setUserData({ ...userData, converted: data });
      }
    };
    if (!userData?.converted || !userData?.dropped) {
      fetchUserData();
    }
  }, [status]);

  useEffect(() => {
    console.log(userData);
  }, [userData]);
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
            onClick={() => setStatus(ConversionStatus.CONVERTED)}
          >
            <Text>Converted</Text>
          </Tab>

          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
            onClick={() => setStatus(ConversionStatus.DROPPED)}
          >
            Dropped
          </Tab>
        </TabList>

        <TabPanels display={'flex'} maxH={'full'} flex={1} overflow={'hidden'}>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            {userData?.converted ? (
              <UserListTable
                handleRowClick={handleRowClick}
                users={userData.converted.users}
                unique_users={userData.converted.uniqueUsers}
                total_users={userData.converted.totalUsers}
              />
            ) : (
              <SkeletonLoader />
            )}
          </TabPanel>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            {userData?.dropped ? (
              <UserListTable
                handleRowClick={handleRowClick}
                users={userData.dropped.users}
                unique_users={userData.dropped.uniqueUsers}
                total_users={userData.dropped.totalUsers}
              />
            ) : (
              <SkeletonLoader />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default UserTableView;
