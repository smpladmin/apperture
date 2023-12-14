import React, { useState } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
} from '@chakra-ui/react';
import { CaretLeft, Plus, X } from 'phosphor-react';

type ActionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ActionDrawer = ({ isOpen, onClose }: ActionDrawerProps) => {
  const [isActionBeingCreated, setIsActionBeingCreated] = useState(false);
  return (
    <Drawer size={'md'} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay bg={'black.DEFAULT'} opacity={'0.8 !important'} />
      <DrawerContent bg={'white.DEFAULT'}>
        <DrawerHeader
          px={'6'}
          py={'5'}
          bg={'white.400'}
          borderBottom={'0.4px solid #BDBDBD'}
        >
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Flex alignItems={'center'} gap={'1'}>
              {isActionBeingCreated && (
                <CaretLeft
                  size={20}
                  cursor={'pointer'}
                  onClick={() => setIsActionBeingCreated(false)}
                />
              )}
              <Text fontSize={'sh-20'} fontWeight={'600'} lineHeight={'sh-20'}>
                Schedule an action
              </Text>
            </Flex>
            <X size={20} cursor={'pointer'} onClick={onClose} />
          </Flex>
        </DrawerHeader>

        <DrawerBody px={'6'} py={'12'} overflow={'scroll'} maxH={'full'}>
          {isActionBeingCreated ? (
            <></>
          ) : (
            <>
              <Text
                fontSize={'xs-14'}
                fontWeight={'500'}
                lineHeight={'xs-14'}
                color={'grey.800'}
              >
                CURRENT ACTIONS
              </Text>
            </>
          )}
        </DrawerBody>

        <DrawerFooter
          px={'7'}
          py={'4'}
          shadow={'0px -2px 15.5px -4px rgba(0, 0, 0, 0.15)'}
        >
          <Button
            variant={'primary'}
            px={'4'}
            py={'6px'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            bg={'black.DEFAULT'}
            color={'white.DEFAULT'}
            borderRadius={'8'}
            alignItems={'center'}
            gap={'2'}
            onClick={() => {
              isActionBeingCreated ? () => {} : setIsActionBeingCreated(true);
            }}
          >
            {isActionBeingCreated ? (
              'Confirm'
            ) : (
              <>
                <Plus size={16} />
                {'Create new action'}
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ActionDrawer;
