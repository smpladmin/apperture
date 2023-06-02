import { Flex, Text } from '@chakra-ui/react';
import { CaptureEvent } from '@lib/domain/action';
import React from 'react';

const EventType = ({ value }: { value: CaptureEvent }) => {
  const eventIcon = {
    [CaptureEvent.AUTOCAPTURE]: 'ri-cursor-fill',
    [CaptureEvent.RAGECLICK]: 'ri-cursor-fill',
    [CaptureEvent.IDENTIFY]: 'ri-cursor-fill',
    [CaptureEvent.PAGEVIEW]: 'ri-eye-fill',
    [CaptureEvent.PAGELEAVE]: 'ri-eye-fill',
  };

  const formatEventText = {
    [CaptureEvent.AUTOCAPTURE]: 'Autocapture',
    [CaptureEvent.RAGECLICK]: 'Rageclick',
    [CaptureEvent.IDENTIFY]: 'Identify',
    [CaptureEvent.PAGEVIEW]: 'Pageview',
    [CaptureEvent.PAGELEAVE]: 'Pageleave',
  };
  return (
    <Flex alignContent={'center'} alignItems={'center'} gap={'1'}>
      <i className={eventIcon[value]} />
      <Text fontWeight={500} fontSize={'xs-12'} lineHeight={'xs-16'}>
        {formatEventText[value]}
      </Text>
    </Flex>
  );
};

export default EventType;
