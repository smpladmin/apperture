import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { DateFilterObj, ExternalSegmentFilter } from '@lib/domain/common';
import {
  ConversionStatus,
  ConversionWindowObj,
  FunnelStep,
  UserActivityResponse,
  UserProperty,
} from '@lib/domain/funnel';
import { getUserActivity } from '@lib/services/datasourceService';
import { getUserProperty } from '@lib/services/funnelService';
import { useEffect, useState } from 'react';
import UserTableView from './UserListTableView';

type UserConversionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  datasourceId: string;
  event: string;
  selectedFunnelSteps: FunnelStep[];
  dateFilter: DateFilterObj;
  conversionWindow: ConversionWindowObj;
  randomSequence: boolean;
  segmentFilters: ExternalSegmentFilter[] | null;
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
  randomSequence,
  segmentFilters,
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
        getUserProperty(
          selectedUser as string,
          datasourceId,
          status == ConversionStatus.CONVERTED ? event : ''
        ),
        getUserActivity(selectedUser as string, datasourceId),
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
    setStatus(ConversionStatus.CONVERTED);
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
              randomSequence={randomSequence}
              selectedUser={selectedUser}
              setUserActivity={setUserActivity}
              isTableDataLoading={isTableDataLoading}
              segmentFilters={segmentFilters}
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
