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
import React, { useState } from 'react';
import EventFields from '../components/EventFields';
import tickIcon from '@assets/icons/black-tick-icon.svg';
import Image from 'next/image';
import { BASTILLE, BLACK_RUSSIAN } from '@theme/index';

const LeftAction = () => {
  const [funnelName, setFunnelName] = useState('Untitled Funnel');
  const [inputFieldsValue, setInputFieldsValue] = useState([
    { eventName: '' },
    { eventName: '' },
  ]);

  const addNewInputField = () => {
    const newField = { eventName: '' };
    setInputFieldsValue([...inputFieldsValue, newField]);
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
          disabled={true}
          borderRadius={'50'}
          _disabled={{
            bg: 'black.30',
            pointerEvents: 'none',
          }}
        >
          <Flex alignItems={'center'} gap={'1'}>
            <Image src={tickIcon} />
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
          >
            {'+'}
          </Button>
        </Flex>
        <EventFields
          eventFieldsValue={inputFieldsValue}
          setEventFieldsValue={setInputFieldsValue}
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

export default LeftAction;
