import React from 'react';
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
} from '@chakra-ui/react';
import UserTableView from './UserListTableView';
import { FunnelEventConversion } from '@lib/domain/funnel';

type UserConversionDrawerProps = {
  isOpen: boolean;
  onOpen: Function;
  onClose: Function;
  conversionData: FunnelEventConversion | null;
};

const UserConversionDrawer = ({
  isOpen,
  onOpen,
  onClose,
  conversionData,
}: any) => {
  return (
    <>
      <Drawer size={'md'} isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay
          backdropFilter={'blur(10px)'}
          bg={'grey.0'}
          opacity={'0.95'}
        />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {conversionData
              ? `Step ${conversionData.step} - ${conversionData.event}`
              : null}
          </DrawerHeader>

          <DrawerBody p={0} overflow={'hidden'} maxH={'full'}>
            {conversionData?.converted && conversionData?.dropped ? (
              <UserTableView
                converted={conversionData.converted}
                dropped={conversionData.dropped}
              />
            ) : null}
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
