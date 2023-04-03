import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
} from '@chakra-ui/react';
import { DateFilterObj } from '@lib/domain/common';
import {
  ConversionStatus,
  ConversionWindowObj,
  FunnelConversionData,
  FunnelStep,
  UserActivityResponse,
  UserProperty,
} from '@lib/domain/funnel';
import { getConversionData } from '@lib/services/funnelService';
import React, { useEffect, useState } from 'react';
import SkeletonLoader from './SkeletonLoader';
import UserListTable from './UserListTable';
import UserPropertyTable from './UserPropertyTable';
import UserActivityTable from './UserActivityTable';
import { TableState } from './index';

type UserTableViewProps = {
  setSelectedUser: Function;
  dsId: string;
  steps: FunnelStep[];
  tableState: TableState;
  properties?: UserProperty[] | null;
  setTableState: Function;
  dateFilter: DateFilterObj;
  conversionWindow: ConversionWindowObj;
  status: ConversionStatus;
  setStatus: Function;
  userActivity: UserActivityResponse;
  selectedUser: any;
  setUserActivity: Function;
};
type FunnelEventConversion = {
  converted?: FunnelConversionData;
  dropped?: FunnelConversionData;
};

const UserTableView = ({
  dsId,
  steps,
  setSelectedUser,
  properties,
  tableState,
  dateFilter,
  conversionWindow,
  status,
  setStatus,
  userActivity,
  selectedUser,
  setUserActivity,
}: UserTableViewProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [userData, setUserData] = useState<FunnelEventConversion>();

  const handleTabChange = (tabIndex: number) => {
    setTabIndex(tabIndex);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData?.dropped && status === ConversionStatus.DROPPED) {
        const data = await getConversionData(
          dsId,
          steps,
          status,
          dateFilter,
          conversionWindow
        );
        setUserData({ ...userData, dropped: data });
      } else if (
        !userData?.converted &&
        status === ConversionStatus.CONVERTED
      ) {
        const data = await getConversionData(
          dsId,
          steps,
          status,
          dateFilter,
          conversionWindow
        );
        setUserData({ ...userData, converted: data });
      }
    };
    if (!userData?.converted || !userData?.dropped) {
      fetchUserData();
    }
  }, [status]);
  const handleRowClick = (user: string) => {
    setTabIndex(0);
    setSelectedUser(user);
  };

  return (
    <Flex w={'full'} maxH={'full'}>
      <Tabs
        index={tabIndex}
        onChange={handleTabChange}
        w={'full'}
        display={'flex'}
        flexDirection={'column'}
      >
        <TabList>
          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
            onClick={() => setStatus(ConversionStatus.CONVERTED)}
          >
            <Text>
              {tableState == TableState.LIST ? 'Converted' : 'Property'}
            </Text>
          </Tab>

          <Tab
            _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
            px={0}
            marginLeft={8}
            _active={{}}
            onClick={() => setStatus(ConversionStatus.DROPPED)}
          >
            {tableState == TableState.LIST ? 'Dropped' : 'Events'}
          </Tab>
        </TabList>

        <TabPanels display={'flex'} maxH={'full'} flex={1} overflow={'scroll'}>
          <TabPanel display={'flex'} overflow={'hidden'} w={'full'}>
            {tableState == TableState.LIST ? (
              userData?.converted ? (
                <UserListTable
                  handleRowClick={handleRowClick}
                  users={userData.converted.users}
                  unique_users={userData.converted.uniqueUsers}
                  total_users={userData.converted.totalUsers}
                />
              ) : (
                <SkeletonLoader />
              )
            ) : properties ? (
              <UserPropertyTable properties={properties as UserProperty[]} />
            ) : (
              <SkeletonLoader />
            )}
          </TabPanel>
          <TabPanel display={'flex'} overflow={'scroll'} w={'full'}>
            {tableState == TableState.LIST ? (
              userData?.dropped ? (
                <UserListTable
                  handleRowClick={handleRowClick}
                  users={userData.dropped.users}
                  unique_users={userData.dropped.uniqueUsers}
                  total_users={userData.dropped.totalUsers}
                />
              ) : (
                <SkeletonLoader />
              )
            ) : userActivity ? (
              <UserActivityTable
                isLoading={false}
                selectedUser={selectedUser}
                userActivity={userActivity}
                setUserActivity={setUserActivity}
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
