import { Box, Button, Divider, Flex, Text } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import emptyAction from '@assets/images/empty-action.svg';
import Image from 'next/image';
import ActionHeader from './components/ActionHeader';
import SelectorsForm from './components/SelectorsForm';
import {
  Action,
  ActionEventData,
  ActionGroup,
  CaptureEvent,
} from '@lib/domain/action';
import ActionTable from './components/ActionTable';
import isEqual from 'lodash/isEqual';
import { isValidAction } from '../utils';
import { useRouter } from 'next/router';
import {
  getTransientActionEvents,
  saveAction,
  updateAction,
} from '@lib/services/actionService';
import DividerWithItem from '@components/Divider/DividerWithItem';
import { cloneDeep } from 'lodash';

const CreateAction = ({ savedAction }: { savedAction?: Action }) => {
  const [actionName, setActionName] = useState(
    savedAction?.name || 'Untitled Action'
  );
  const [isEmpty, setIsEmpty] = useState(savedAction ? false : true);
  const [groups, setGroups] = useState<ActionGroup[]>(
    savedAction?.groups || [
      {
        href: null,
        selector: null,
        text: null,
        url: null,
        url_matching: '',
        event: CaptureEvent.AUTOCAPTURE,
      },
    ]
  );
  const [isSaveDisabled, setIsSavedDisabled] = useState(true);
  const [isActionBeingEdited, setIsActionBeingEdited] = useState(false);
  const [transientActionEvents, setTransientActionEvents] =
    useState<ActionEventData>({
      count: 0,
      data: [],
    });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const {
    pathname,
    query: { dsId, actionId },
  } = router;

  const datasourceId = dsId || savedAction?.datasourceId;

  useEffect(() => {
    if (pathname.includes('/analytics/action/edit'))
      setIsActionBeingEdited(true);
  }, []);

  useEffect(() => {
    if (isValidAction(groups)) {
      setIsSavedDisabled(false);
      setIsEmpty(false);
    } else {
      setIsSavedDisabled(true);
      setIsEmpty(true);
    }
  }, [groups]);

  useEffect(() => {
    if (!savedAction) return;

    if (isValidAction(groups) && isEqual(savedAction.groups, groups)) {
      setIsSavedDisabled(true);
    }
  }, [groups]);

  useEffect(() => {
    if (!isValidAction(groups)) return;

    const fetchTransientEvents = async () => {
      const res = await getTransientActionEvents(
        datasourceId as string,
        groups
      );
      setTransientActionEvents(res);
      setIsLoading(false);
    };

    fetchTransientEvents();
    setIsLoading(true);
  }, [groups]);

  const updateGroupAction = useCallback(
    (groups: ActionGroup[]) => {
      setGroups(groups);
    },
    [groups]
  );

  const addNewGroup = () => {
    setGroups([
      ...groups,
      {
        href: null,
        selector: null,
        text: null,
        url: null,
        url_matching: '',
        event: CaptureEvent.AUTOCAPTURE,
      },
    ]);
  };

  const removeGroup = (index: number) => {
    const tempGroups = cloneDeep(groups);
    tempGroups.splice(index, 1);
    setGroups(tempGroups);
  };

  const saveOrUpdateAction = async () => {
    const response = isActionBeingEdited
      ? await updateAction(
          actionId as string,
          datasourceId as string,
          actionName,
          groups
        )
      : await saveAction(datasourceId as string, actionName, groups);

    if (response?.status === 200) {
      const { _id, datasourceId } = response?.data;
      router.push({
        pathname: '/analytics/action/edit/[actionId]',
        query: { actionId: _id || actionId, dsId: datasourceId },
      });
    }
  };

  return (
    <Box h={'full'} overflow={'auto'} overflowY={'hidden'}>
      <ActionHeader
        actionName={actionName}
        setActionName={setActionName}
        isSaveDisabled={isSaveDisabled}
        saveOrUpdateAction={saveOrUpdateAction}
      />
      <Flex h={'full'} w={'full'}>
        <Box
          pt={'4'}
          px={'5'}
          minW={'106'}
          borderRight={'1px'}
          borderColor={'white.200'}
          pb={24}
          overflow="auto"
        >
          <Flex justifyContent={'space-between'} alignItems="center">
            <Text
              fontSize={'sh-18'}
              lineHeight={'sh-22'}
              fontWeight={'500'}
              py={5}
            >
              Match Groups
            </Text>
            <Button
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={500}
              p={1}
              mt={2}
              h={'min-content'}
              bg="none"
              onClick={addNewGroup}
            >
              <i className="ri-add-fill"></i>
              <Text ml={1}>Groups</Text>
            </Button>
          </Flex>
          <Flex
            borderWidth={'0.4px'}
            borderRadius={'12'}
            borderColor={'grey.100'}
            direction="column"
          >
            {groups.map((group, index) => (
              <>
                {index > 0 && (
                  <DividerWithItem color={'grey.100'}>
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'xs-16'}
                      fontWeight={600}
                      px={2}
                      py={1}
                      bg={'white.100'}
                      borderRadius={4}
                    >
                      OR
                    </Text>
                  </DividerWithItem>
                )}
                <SelectorsForm
                  key={index}
                  index={index}
                  group={group}
                  groups={groups}
                  updateGroupAction={updateGroupAction}
                  handleClose={removeGroup}
                />
              </>
            ))}
          </Flex>
        </Box>
        <Box w={'full'} overflow={'auto'} pt={'4'} px={'8'}>
          {isEmpty ? (
            <Flex justifyContent={'center'} mt={'50'}>
              <Image src={emptyAction} alt={'empty-action-image'} />
            </Flex>
          ) : (
            <ActionTable
              isLoading={isLoading}
              tableData={transientActionEvents}
            />
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default CreateAction;
