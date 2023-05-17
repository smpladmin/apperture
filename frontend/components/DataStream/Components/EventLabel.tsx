import { Flex, IconButton, Text } from '@chakra-ui/react';
import { autoCaptureEventToDescription } from '@lib/utils/common';
import { useState } from 'react';

export const formateventLabel = (event: any) => {
  const label = event.name;
  if (label == '$pageview') return ['ri-eye-fill', 'Pageview'];
  if (label == '$pageleave') return ['ri-delete-back-2-fill', 'Pageleave'];
  if (label == '$autocapture')
    return ['ri-cursor-fill', autoCaptureEventToDescription(event)];
  if (label == '$identify') return ['ri-cursor-fill', 'Identify'];
  if (label == '$rageclick') return ['ri-cursor-fill', 'Rage Click'];
  return ['ri-edit-box-fill', label];
};

const EventLabel = ({ event }: { event: any }) => {
  const [data, setData] = useState(formateventLabel(event));
  return (
    <Flex alignContent={'center'} alignItems={'center'}>
      <IconButton
        bg={'none'}
        p={0}
        px={1}
        size={'small'}
        aria-label="event"
        _hover={{}}
        icon={<i style={{ fontSize: 'xs-8' }} className={data[0]}></i>}
      />
      <Text
        data-testid="event-cell"
        fontWeight={500}
        fontSize={'xs-12'}
        lineHeight={'xs-16'}
      >
        {data[1]}
      </Text>
    </Flex>
  );
};

export default EventLabel;
