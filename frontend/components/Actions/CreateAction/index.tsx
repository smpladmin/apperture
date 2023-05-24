import { Box, Button, Divider, Flex, Text, useToast } from '@chakra-ui/react';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import emptyAction from '@assets/images/empty-action.svg';
import Image from 'next/image';
import ActionHeader from './components/ActionHeader';
import SelectorsForm from './components/SelectorsForm';
import {
  Action,
  ActionMetaData,
  ActionGroup,
  CaptureEvent,
  UrlMatching,
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
import DateFilter from '@components/Date/DateFilter';
import { DateFilterObj, DateFilterType } from '@lib/domain/common';

const CreateAction = ({ savedAction }: { savedAction?: Action }) => {
  const toast = useToast();
  const [actionName, setActionName] = useState(
    savedAction?.name || 'Untitled Action'
  );
  const [isEmpty, setIsEmpty] = useState(savedAction ? false : true);
  const [groups, setGroups] = useState<ActionGroup[]>(
    savedAction?.groups.map((group) =>
      group.event ? group : { ...group, event: savedAction.eventType }
    ) || [
      {
        href: null,
        selector: null,
        text: null,
        url: null,
        url_matching: UrlMatching.CONTAINS,
        event: CaptureEvent.AUTOCAPTURE,
      },
    ]
  );
  const [isSaveDisabled, setIsSavedDisabled] = useState(true);
  const [isActionBeingEdited, setIsActionBeingEdited] = useState(false);
  const [transientActionEvents, setTransientActionEvents] =
    useState<ActionMetaData>({
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
  const readOnly = Boolean(savedAction?.datasourceId);

  const [dateFilter, setDateFilter] = useState<DateFilterObj>({
    filter: { days: 7 },
    type: DateFilterType.LAST,
  });

  useEffect(() => {
    if (pathname.includes('/analytics/action/view'))
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
        groups,
        dateFilter
      );
      setTransientActionEvents(res);
      setIsLoading(false);
    };

    fetchTransientEvents();
    setIsLoading(true);
  }, [groups, dateFilter]);

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
        url_matching: UrlMatching.CONTAINS,
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

    setIsSavedDisabled(true);

    if (response?.status === 200 && response.data) {
      const { _id, datasourceId } = response?.data;
      router.push({
        pathname: '/analytics/action/view/[actionId]',
        query: { actionId: _id || actionId, dsId: datasourceId },
      });
    }
    if (response?.status === 400 && !response.data) {
      setIsSavedDisabled(false);
      toast({
        title: 'Action name already exists',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
    }
  };

  return (
    <Box h={'full'} overflow={'auto'} overflowY={'hidden'}>
      <ActionHeader
        isDisabled={readOnly}
        actionName={actionName}
        setActionName={setActionName}
        isSaveDisabled={isSaveDisabled}
        saveOrUpdateAction={saveOrUpdateAction}
      />
      <Flex h={'full'} w={'full'} pb={'24'}>
        <Box
          pt={'4'}
          px={'5'}
          minW={'106'}
          borderRight={'1px'}
          borderColor={'white.200'}
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
            {!readOnly && (
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
            )}
          </Flex>
          <Flex
            borderWidth={'0.4px'}
            borderRadius={'12'}
            borderColor={'grey.100'}
            direction="column"
          >
            {groups.map((group, index) => (
              <Fragment key={'divider-' + index}>
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
                  isDisabled={readOnly}
                />
              </Fragment>
            ))}
          </Flex>
        </Box>
        <Box w={'full'} overflow={'auto'} pt={'4'} px={'8'}>
          <Flex direction={'column'}>
            <DateFilter
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              isDisabled={readOnly}
            />
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
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default CreateAction;
