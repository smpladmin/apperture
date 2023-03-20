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
  UserProperty,
} from '@lib/domain/funnel';
import { getConversionData } from '@lib/services/funnelService';
import React, { useEffect, useState } from 'react';
import { TableState } from '.';
import SkeletonLoader from './SkeletonLoader';
import UserListTable from './UserListTable';
import UserPropertyTable from './UserPropertyTable';

type UserTableViewProps = {
  setSelectedUser: Function;
  dsId: string;
  steps: FunnelStep[];
  tableState: TableState;
  properties?: UserProperty[] | null;
  setTableState: Function;
  dateFilter: DateFilterObj;
  conversionWindow: ConversionWindowObj;
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
}: UserTableViewProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [userData, setUserData] = useState<FunnelEventConversion>();
  const [status, setStatus] = useState<ConversionStatus>(
    ConversionStatus.CONVERTED
  );

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

          {tableState == TableState.LIST ? (
            <Tab
              _selected={{ fontWeight: 600, borderBottom: '2px solid black' }}
              px={0}
              marginLeft={8}
              _active={{}}
              onClick={() => setStatus(ConversionStatus.DROPPED)}
            >
              Dropped
            </Tab>
          ) : null}
        </TabList>

        <TabPanels display={'flex'} maxH={'full'} flex={1} overflow={'hidden'}>
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
          {tableState == TableState.LIST ? (
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
          ) : null}
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default UserTableView;
