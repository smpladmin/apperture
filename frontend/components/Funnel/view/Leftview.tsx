import { Button, Divider, Flex, IconButton, Text } from '@chakra-ui/react';
import LeftPanel from '@components/EventsLayout/LeftPanel';
import React, { useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import { BASTILLE } from '@theme/index';
import IconButtonSet from './IconButtonSet';
import FunnelFlow from './FunnelFlow';
import ConversionCard from './ConversionCard';
import Render from '@components/Render';

const Leftview = () => {
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
        />
        <Render on="desktop">
          <Button
            borderRadius={'50'}
            bg={'black.300'}
            borderColor={'grey.300'}
            borderWidth={'1px'}
            color={'white'}
            variant={'primary'}
          >
            <Flex alignItems={'center'} gap={'1'}>
              <i className="ri-edit-fill"></i>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'medium'}
                color={'white'}
              >
                Edit
              </Text>
            </Flex>
          </Button>
        </Render>
      </Flex>

      <Flex
        direction={'row'}
        mt={'8'}
        gap={'2'}
        justifyContent={'space-between'}
      >
        <Text
          fontSize={{ base: 'sh-20', md: 'sh-32' }}
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          borderColor={'grey.10'}
          px={0}
        >
          Checkout Flow
        </Text>
        <Render on="mobile">
          <Button
            borderRadius={'50'}
            bg={'black.300'}
            borderColor={'grey.300'}
            borderWidth={'1px'}
            color={'white'}
            variant={'primary'}
          >
            <Flex alignItems={'center'} gap={'1'}>
              <i className="ri-edit-fill"></i>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'medium'}
                color={'white'}
              >
                Edit
              </Text>
            </Flex>
          </Button>
        </Render>
      </Flex>
      <Flex direction={'column'} mt={{ base: '1', md: '4' }}>
        <FunnelFlow />
        <IconButtonSet />
        <Render on="desktop">
          <Divider
            my={'8'}
            orientation="horizontal"
            borderColor={BASTILLE}
            opacity={1}
          />
          <Flex direction={'column'} gap={'4'}>
            <ConversionCard />
          </Flex>
        </Render>
      </Flex>
    </LeftPanel>
  );
};

export default Leftview;
