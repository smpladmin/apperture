import {
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Switch,
  Text,
} from '@chakra-ui/react';
import LeftPanel from '@components/EventsLayout/LeftPanel';
import React, { useContext, useEffect, useState } from 'react';
import EventFields from '../components/EventFields';
import tickIcon from '@assets/icons/black-tick-icon.svg';
import Image from 'next/image';
import { BASTILLE, BLACK_RUSSIAN } from '@theme/index';
import { filterEmptySteps, getCountOfValidAddedSteps } from '../util';
import { saveFunnel } from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import { MapContext } from '@lib/contexts/mapContext';
import { FunnelStep } from '@lib/domain/funnel';

type CreateFunnelActionProps = {
  funnelName: string;
  setFunnelName: Function;
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
  setFunnelData: Function;
};

const CreateFunnelAction = ({
  funnelName,
  setFunnelName,
  funnelSteps,
  setFunnelSteps,
  setFunnelData,
}: CreateFunnelActionProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(true);

  const router = useRouter();
  const { dsId } = router.query;

  const addNewInputField = () => {
    const newField = { event: '', filters: [] };
    setFunnelSteps([...funnelSteps, newField]);
  };

  useEffect(() => {
    if (getCountOfValidAddedSteps(funnelSteps, nodes) >= 2) {
      setSaveButtonDisabled(false);
    } else {
      setSaveButtonDisabled(true);
    }
  }, [funnelSteps, nodes]);

  const handleSaveFunnel = async () => {
    const res = await saveFunnel(
      dsId as string,
      funnelName,
      filterEmptySteps(funnelSteps),
      false
    );

    if (res?.status === 200) {
      router.push(`/analytics/viewFunnel/${res.id}`);
    }
  };

  return (
    <LeftPanel>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          color={'white.DEFAULT'}
          bg={'black.20'}
          onClick={() => {}}
        />
        <Button
          disabled={isSaveButtonDisabled}
          borderRadius={'50'}
          _disabled={{
            bg: 'black.30',
            pointerEvents: 'none',
          }}
          onClick={handleSaveFunnel}
        >
          <Flex alignItems={'center'} gap={'1'}>
            <Image src={tickIcon} alt={'tick'} />
            <Text
              color={BLACK_RUSSIAN}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'medium'}
            >
              Save
            </Text>
          </Flex>
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
          fontSize={'sh-32'}
          lineHeight={'sh-32'}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          value={funnelName}
          focusBorderColor={'white.DEFAULT'}
          onChange={(e) => setFunnelName(e.target.value)}
          borderColor={'grey.10'}
          px={0}
        />
      </Flex>

      <Flex direction={'column'} gap={'4'} mt={'9'}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text
            fontSize={'sh-24'}
            lineHeight={'sh-24'}
            fontWeight={'normal'}
            color={'white.DEFAULT'}
          >
            Steps
          </Text>
          <Button
            rounded={'full'}
            variant={'primary'}
            size={'md'}
            bg={'black.20'}
            color={'white.DEFAULT'}
            onClick={addNewInputField}
            fontSize={'sh-20'}
          >
            {'+'}
          </Button>
        </Flex>
        <EventFields
          eventFieldsValue={funnelSteps}
          setEventFieldsValue={setFunnelSteps}
          setFunnelData={setFunnelData}
        />
        <Divider
          mt={'4'}
          orientation="horizontal"
          borderColor={BASTILLE}
          opacity={1}
        />
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text
            fontSize={'base'}
            lineHeight={'base'}
            fontWeight={'normal'}
            color={'white.DEFAULT'}
          >
            Steps in any order
          </Text>
          <Switch background={'black'} size={'sm'} />
        </Flex>
      </Flex>
    </LeftPanel>
  );
};

export default CreateFunnelAction;
