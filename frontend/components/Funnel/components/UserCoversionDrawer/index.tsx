import React, { useEffect, useRef, useState } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Text,
  IconButton,
  Flex,
  Box,
} from '@chakra-ui/react';
import UserTableView from './UserListTableView';
import {
  ConversionStatus,
  ConversionWindowObj,
  FunnelStep,
  UserProperty,
  UserActivityResponse,
} from '@lib/domain/funnel';
import { getUserProperty } from '@lib/services/funnelService';
import { DateFilterObj } from '@lib/domain/common';
import { getUserActivity } from '@lib/services/datasourceService';

type UserConversionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  datasourceId: string;
  event: string;
  selectedFunnelSteps: FunnelStep[];
  dateFilter: DateFilterObj;
  conversionWindow: ConversionWindowObj;
};

export enum TableState {
  LIST = 'list',
  PROPERTY = 'property',
}

const UserConversionDrawer = ({
  isOpen,
  onClose,
  datasourceId,
  event,
  selectedFunnelSteps,
  dateFilter,
  conversionWindow,
}: UserConversionDrawerProps) => {
  const [tableState, setTableState] = useState<TableState>(TableState.PROPERTY);
  const [selectedUser, setSelectedUser] = useState<null | string>(null);
  const [userProperty, setUserProperty] = useState<UserProperty[] | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityResponse>({
    count: 0,
    data: [],
  });
  const [status, setStatus] = useState<ConversionStatus>(
    ConversionStatus.CONVERTED
  );
  const [isTableDataLoading, setIsTableDataLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const [propertyResponse, activityResponse] = await Promise.all([
        await getUserProperty(
          selectedUser as string,
          datasourceId,
          status == ConversionStatus.CONVERTED ? event : ''
        ),
        await getUserActivity(selectedUser as string, datasourceId),
      ]);

      if (propertyResponse.property) {
        const property: UserProperty[] = Object.keys(propertyResponse.property)
          .map((property) => {
            return {
              Property: property,
              Value:
                typeof propertyResponse.property[property] == 'object'
                  ? JSON.stringify(propertyResponse.property[property])
                  : propertyResponse.property[property],
            };
          })
          .filter((property) => property.Value);
        setUserProperty(property);
      }
      setUserActivity(activityResponse);
      setIsTableDataLoading(false);
    };

    if (selectedUser) {
      setTableState(TableState.PROPERTY);
      setIsTableDataLoading(true);
      fetchUserDetails();
    } else {
      setTableState(TableState.LIST);
    }
  }, [selectedUser]);

  const handleClose = () => {
    onClose();
    setTableState(TableState.LIST);
  };

  return (
    <>
      <Drawer
        size={'md'}
        isOpen={isOpen}
        placement="right"
        onClose={handleClose}
      >
        <DrawerOverlay
          backdropFilter={'blur(10px)'}
          bg={'grey.0'}
          opacity={'0.95'}
        />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader paddingRight={10}>
            {tableState == TableState.LIST ? (
              `Step ${event}`
            ) : (
              <Flex direction={'column'}>
                <Box>
                  <IconButton
                    minW={{ base: '8', md: '10' }}
                    h={{ base: '8', md: '10' }}
                    fontWeight={'500'}
                    aria-label="Journey Map"
                    variant={'iconButton'}
                    icon={<i className="ri-arrow-left-line"></i>}
                    rounded={'full'}
                    color={'black.100'}
                    border={'1px solid #EDEDED'}
                    onClick={() => {
                      setTableState(TableState.LIST);
                      setUserProperty(null);
                      setSelectedUser(null);
                      setUserActivity({
                        count: 0,
                        data: [],
                      });
                    }}
                  />
                </Box>
                <Text mt={6} fontWeight={500} fontSize={'18'} lineHeight="22px">
                  {selectedUser}
                </Text>
              </Flex>
            )}
          </DrawerHeader>

          <DrawerBody p={0} overflow={'hidden'} maxH={'full'}>
            <UserTableView
              dsId={datasourceId}
              steps={selectedFunnelSteps}
              setSelectedUser={setSelectedUser}
              properties={userProperty as UserProperty[]}
              userActivity={userActivity}
              tableState={tableState}
              setTableState={setTableState}
              dateFilter={dateFilter}
              conversionWindow={conversionWindow}
              status={status}
              setStatus={setStatus}
              selectedUser={selectedUser}
              setUserActivity={setUserActivity}
              isTableDataLoading={isTableDataLoading}
            />
          </DrawerBody>

          <DrawerFooter>
            <Button mr={3} onClick={onClose}>
              <Text fontSize={'12px'} lineHeight={'16px'} fontWeight={500}>
                Save as Segment
              </Text>
            </Button>
            <Button variant="dark">
              <Text
                fontSize={'12px'}
                lineHeight={'16px'}
                fontWeight={500}
                color={'white'}
              >
                Export as CSV
              </Text>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default UserConversionDrawer;
