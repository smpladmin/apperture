import React, { useEffect, useState } from 'react';
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
import { FunnelEventConversion, UserProperty } from '@lib/domain/funnel';
import { getUserProperty } from '@lib/services/funnelService';
import UserPropertyTable from './UserPropertyTable';

type UserConversionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  conversionData: FunnelEventConversion | null;
  datasourceId: string;
  event: string;
};

export enum TableState {
  LIST = 'list',
  PROPERTY = 'property',
}

const UserConversionDrawer = ({
  isOpen,
  onClose,
  conversionData,
  datasourceId,
  event,
}: UserConversionDrawerProps) => {
  const [tableState, setTableState] = useState<TableState>(TableState.PROPERTY);
  const [selectedUser, setSelectedUser] = useState<null | string>(null);
  const [userProperty, setUserProperty] = useState<UserProperty[] | null>(null);
  useEffect(() => {
    const fetchUserProperty = async () => {
      const response = await getUserProperty(
        selectedUser as string,
        datasourceId,
        event
      );
      if (response.property) {
        const property: UserProperty[] = Object.keys(response.property).map(
          (property) => {
            return {
              Property: property,
              Value: response[property] || '',
            };
          }
        );
        setUserProperty(property);
      }
    };
    if (selectedUser) {
      setTableState(TableState.PROPERTY);
      fetchUserProperty();
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
          <DrawerHeader>
            {tableState == TableState.LIST ? (
              conversionData ? (
                `Step ${conversionData.step} - ${conversionData.event}`
              ) : null
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
                    }}
                  />
                </Box>
                <Text mt={6} fontWeight={500} fontSize={'18'} lineHeight="22px">
                  UID
                </Text>
              </Flex>
            )}
          </DrawerHeader>

          <DrawerBody p={0} overflow={'hidden'} maxH={'full'}>
            {tableState == TableState.LIST
              ? conversionData?.converted &&
                conversionData?.dropped && (
                  <UserTableView
                    converted={conversionData.converted}
                    dropped={conversionData.dropped}
                    setSelectedUser={setSelectedUser}
                  />
                )
              : userProperty && (
                  <UserPropertyTable
                    properties={userProperty as UserProperty[]}
                  />
                )}
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
