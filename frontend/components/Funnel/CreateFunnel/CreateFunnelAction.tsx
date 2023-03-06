import {
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Switch,
  Text,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import EventFields from '../components/EventFields';
import { BASTILLE, BLACK_RUSSIAN } from '@theme/index';
import {
  filterFunnelSteps,
  getCountOfValidAddedSteps,
  isEveryFunnelStepFiltersValid,
} from '../util';
import { saveFunnel, updateFunnel } from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import { MapContext } from '@lib/contexts/mapContext';
import { FunnelStep } from '@lib/domain/funnel';
import {
  deleteNotification,
  getNotificationByReference,
} from '@lib/services/notificationService';

type CreateFunnelActionProps = {
  funnelName: string;
  setFunnelName: Function;
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
  setIsStepAdded: Function;
};

const CreateFunnelAction = ({
  funnelName,
  setFunnelName,
  funnelSteps,
  setFunnelSteps,
  setIsStepAdded,
}: CreateFunnelActionProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);
  const funnelInputRef = useRef<HTMLInputElement>(null);
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [isFunnelBeingEdited, setFunnelBeingEdited] = useState(false);

  const router = useRouter();
  const { dsId, funnelId } = router.query;

  const handleAddNewStep = () => {
    const newField = { event: '', filters: [] };
    setFunnelSteps([...funnelSteps, newField]);
    setIsStepAdded(true);
  };

  useEffect(() => {
    if (router.pathname.includes('edit')) setFunnelBeingEdited(true);
  }, []);

  useEffect(() => {
    funnelInputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if (
      getCountOfValidAddedSteps(funnelSteps) >= 2 &&
      isEveryFunnelStepFiltersValid(funnelSteps)
    ) {
      setSaveButtonDisabled(false);
    } else {
      setSaveButtonDisabled(true);
    }
  }, [funnelSteps, nodes]);

  const handleSaveFunnel = async () => {
    const { data, status } = isFunnelBeingEdited
      ? await updateFunnel(
          funnelId as string,
          dsId as string,
          funnelName,
          filterFunnelSteps(funnelSteps),
          false
        )
      : await saveFunnel(
          dsId as string,
          funnelName,
          filterFunnelSteps(funnelSteps),
          false
        );

    if (status === 200)
      router.push({
        pathname: '/analytics/funnel/view/[funnelId]',
        query: { funnelId: data?._id || funnelId, dsId },
      });
  };

  return (
    <>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'primary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          color={'white.DEFAULT'}
          bg={'black.20'}
          onClick={() => {
            router.back();
          }}
        />

        <Button
          disabled={isSaveButtonDisabled}
          borderRadius={'50'}
          _disabled={{
            bg: 'black.30',
            pointerEvents: 'none',
          }}
          onClick={handleSaveFunnel}
          data-testid={'save'}
        >
          <Text
            textAlign={'center'}
            color={BLACK_RUSSIAN}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'medium'}
          >
            Save
          </Text>
        </Button>
      </Flex>

      <Flex direction={'column'} mt={'8'} gap={'2'}>
        <Text
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'normal'}
          color={'grey.DEFAULT'}
        >
          Alias
        </Text>
        <Input
          pr={'4'}
          type={'text'}
          variant="flushed"
          fontSize={{ base: 'sh-20', md: 'sh-32' }}
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          ref={funnelInputRef}
          onFocus={(e) =>
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length
            )
          }
          value={funnelName}
          focusBorderColor={'white.DEFAULT'}
          onChange={(e) => setFunnelName(e.target.value)}
          borderColor={'grey.10'}
          px={0}
          data-testid={'funnel-name'}
        />
      </Flex>

      <Flex direction={'column'} gap={'4'} mt={{ base: '6', md: '8' }}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text
            fontSize={{ base: 'sh-18', md: 'sh-24' }}
            lineHeight={{ base: 'sh-18', md: 'sh-24' }}
            fontWeight={{ base: '500', md: '400' }}
            color={'white.DEFAULT'}
          >
            Steps
          </Text>
          <Button
            data-testid={'add-button'}
            rounded={'full'}
            variant={'primary'}
            size={'md'}
            bg={'black.20'}
            color={'white.DEFAULT'}
            onClick={handleAddNewStep}
            fontSize={'sh-20'}
          >
            {'+'}
          </Button>
        </Flex>
        <EventFields
          funnelSteps={funnelSteps}
          setFunnelSteps={setFunnelSteps}
        />
        <Divider orientation="horizontal" borderColor={BASTILLE} opacity={1} />
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            fontWeight={'normal'}
            color={'white.DEFAULT'}
          >
            In any sequence
          </Text>
          <Switch background={'black'} size={'sm'} isDisabled />
        </Flex>
      </Flex>
    </>
  );
};

export default CreateFunnelAction;
