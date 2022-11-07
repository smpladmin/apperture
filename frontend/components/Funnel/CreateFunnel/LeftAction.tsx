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
          bg={'rgba(255, 255, 255, 0.05)'}
          onClick={() => {}}
        />
        <Button
          disabled={true}
          borderRadius={'50'}
          _disabled={{
            bg: 'rgba(255, 255, 255,0.08)',
            pointerEvents: 'none',
          }}
        >
          {'Save'}
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
          borderColor={'rgba(255, 255, 255, 0.2)'}
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
            bg={'rgba(255, 255, 255, 0.05)'}
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
          borderColor={'#282836'}
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
