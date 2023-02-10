import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import emptyAction from '@assets/images/empty-action.svg';
import Image from 'next/image';
import ActionHeader from './components/ActionHeader';
import SelectorsForm from './components/SelectorsForm';
import { Action, ActionGroup } from '@lib/domain/action';
import ActionTable from './components/ActionTable';
import isEqual from 'lodash/isEqual';

const CreateAction = ({ savedAction }: { savedAction?: Action }) => {
  const [actionName, setActionName] = useState(
    savedAction?.name || 'Untitled Action'
  );
  const [isEmpty, setIsEmpty] = useState(false);
  const [groups, setGroups] = useState<ActionGroup[]>(
    savedAction?.groups || [
      {
        href: '',
        selector: '',
        text: '',
        url: '',
      },
    ]
  );

  const [isSaveDisabled, setIsSavedDisabled] = useState(true);

  useEffect(() => {
    const isValidAction = groups.every((group) => {
      return (Object.keys(group) as [keyof ActionGroup]).some((groupKey) =>
        Boolean(group[groupKey])
      );
    });

    if (isValidAction) {
      setIsSavedDisabled(false);
    } else {
      setIsSavedDisabled(true);
    }

    if (
      savedAction?.groups &&
      isValidAction &&
      isEqual(savedAction.groups, groups)
    ) {
      setIsSavedDisabled(true);
    }
  }, [groups]);

  return (
    <Box h={'full'} overflow={'auto'} overflowY={'hidden'}>
      <ActionHeader
        actionName={actionName}
        setActionName={setActionName}
        isSaveDisabled={isSaveDisabled}
      />
      <Flex h={'full'}>
        <Box
          pt={'4'}
          px={'5'}
          minW={'106'}
          borderRight={'1px'}
          borderColor={'white.200'}
        >
          <Text fontSize={'sh-18'} lineHeight={'sh-18'} fontWeight={'500'}>
            Define Actions
          </Text>
          <SelectorsForm />
        </Box>
        <Box w={'full'} overflow={'auto'} pt={'4'} px={'8'}>
          {isEmpty ? (
            <Flex alignItems={'center'} justifyContent={'center'} h={'full'}>
              <Image src={emptyAction} alt={'empty-action-image'} />
            </Flex>
          ) : (
            <ActionTable />
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default CreateAction;
