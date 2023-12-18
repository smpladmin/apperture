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
import ActionSteps from './ActionSteps';
import { useRouter } from 'next/router';
import { DatamartAction } from '@lib/domain/datamartActions';
import SavedActionsList from './SavedActionsList';
import EmptyCreateAction from '@assets/images/create-action.svg';
import Image from 'next/image';

type ActionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  datamartId: string;
  workbookName: string;
  savedDatamartActions?: DatamartAction[];
  isAuthenticated?: boolean;
};

const ActionDrawer = ({
  isOpen,
  onClose,
  datamartId,
  workbookName,
  savedDatamartActions,
  isAuthenticated,
}: ActionDrawerProps) => {
  const router = useRouter();
  const { showActionDrawer } = router.query;
  const [isActionBeingCreated, setIsActionBeingCreated] = useState(
    !!showActionDrawer
  );
  const [isCreateActionDisabled, setIsCreateActionDisabled] = useState(true);
  const [triggerSave, setTriggerSave] = useState(false);
  const [datamartActions, setDatartActions] = useState<DatamartAction[]>(
    savedDatamartActions || []
  );
  const [action, setAction] = useState<DatamartAction>();

  return (
    <Drawer size={'lg'} isOpen={isOpen} placement="right" onClose={onClose}>
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
            <ActionSteps
              datamartId={datamartId}
              action={action}
              workbookName={workbookName}
              triggerSave={triggerSave}
              setTriggerSave={setTriggerSave}
              setIsActionBeingCreated={setIsActionBeingCreated}
              setIsCreateActionDisabled={setIsCreateActionDisabled}
              setDatartActions={setDatartActions}
              onClose={onClose}
              isAuthenticated={isAuthenticated}
            />
          ) : datamartActions.length ? (
            <SavedActionsList
              datamartActions={datamartActions}
              setDatartActions={setDatartActions}
              setIsActionBeingCreated={setIsActionBeingCreated}
              setAction={setAction}
            />
          ) : (
            <Flex
              mt={'20'}
              justifyContent={'center'}
              direction={'column'}
              gap={'14'}
            >
              <Image src={EmptyCreateAction} alt={'create action'} />
              <Flex direction={'column'} gap={'2'} justifyContent={'center'}>
                <Text
                  fontSize={'sh-24'}
                  lineHeight={'sh-24'}
                  fontWeight={'700'}
                  color={'grey.900'}
                  textAlign={'center'}
                >
                  Create new action
                </Text>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'400'}
                  color={'grey.700'}
                  textAlign={'center'}
                >
                  Send the result automatically. Anywhere you like.
                </Text>
              </Flex>
            </Flex>
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
              isActionBeingCreated
                ? setTriggerSave(true)
                : setIsActionBeingCreated(true);
            }}
            isDisabled={
              isActionBeingCreated && (isCreateActionDisabled || triggerSave)
            }
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
